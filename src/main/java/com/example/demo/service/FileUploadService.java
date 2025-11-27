package com.example.demo.service;

import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class FileUploadService {

    // parse file and estimate CO2 in kilograms using simple heuristics
    public BigDecimal parseAndEstimateCo2Kg(MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            AutoDetectParser parser = new AutoDetectParser();
            BodyContentHandler handler = new BodyContentHandler(-1);
            Metadata metadata = new Metadata();
            parser.parse(is, handler, metadata, new ParseContext());

            String text = handler.toString().toLowerCase(Locale.ROOT);
            log.info("Parsed text length: {}", text.length());

            BigDecimal totalKg = BigDecimal.ZERO;

            // 1) explicit CO2 quantities: e.g. "123 kg co2", "0.5 t co2", "2 tons co2"
            Pattern co2Pattern = Pattern.compile("(\\d+[\\.,]?\\d*)\\s*(kg|kilos|kilograms|t|ton|tons|tonne|tonnes)\\s*(co2)?");
            Matcher m = co2Pattern.matcher(text);
            while (m.find()) {
                String numRaw = m.group(1).replace(',', '.');
                BigDecimal val = new BigDecimal(numRaw);
                String unit = m.group(2);
                if (unit.startsWith("t") || unit.contains("ton")) {
                    totalKg = totalKg.add(val.multiply(BigDecimal.valueOf(1000)));
                } else {
                    totalKg = totalKg.add(val);
                }
            }

            // 2) energy usage kWh -> approximate factor 0.475 kg CO2 / kWh (example)
            Pattern kwhPattern = Pattern.compile("(\\d+[\\.,]?\\d*)\\s*(kwh)\b");
            m = kwhPattern.matcher(text);
            while (m.find()) {
                String numRaw = m.group(1).replace(',', '.');
                BigDecimal val = new BigDecimal(numRaw);
                BigDecimal kg = val.multiply(BigDecimal.valueOf(0.475));
                totalKg = totalKg.add(kg);
            }

            // 3) distance km -> approximate factor 0.21 kg CO2 / km (average car)
            Pattern kmPattern = Pattern.compile("(\\d+[\\.,]?\\d*)\\s*(km)\b");
            m = kmPattern.matcher(text);
            while (m.find()) {
                String numRaw = m.group(1).replace(',', '.');
                BigDecimal val = new BigDecimal(numRaw);
                BigDecimal kg = val.multiply(BigDecimal.valueOf(0.21));
                totalKg = totalKg.add(kg);
            }

            // 4) liters of petrol (l) -> approx 2.31 kg CO2 / liter
            Pattern lPattern = Pattern.compile("(\\d+[\\.,]?\\d*)\\s*(l|liters|litres)\b");
            m = lPattern.matcher(text);
            while (m.find()) {
                String numRaw = m.group(1).replace(',', '.');
                BigDecimal val = new BigDecimal(numRaw);
                BigDecimal kg = val.multiply(BigDecimal.valueOf(2.31));
                totalKg = totalKg.add(kg);
            }

            // If nothing found, try to find any number followed by possible unit words
            if (totalKg.compareTo(BigDecimal.ZERO) == 0) {
                // try to detect standalone numbers with "co2" nearby
                Pattern looseCo2 = Pattern.compile("(co2)\\D{0,20}(\\d+[\\.,]?\\d*)|(\\d+[\\.,]?\\d*)\\D{0,20}(co2)");
                m = looseCo2.matcher(text);
                if (m.find()) {
                    String num = m.group(2) != null ? m.group(2) : m.group(3);
                    if (num != null) {
                        BigDecimal val = new BigDecimal(num.replace(',', '.'));
                        totalKg = totalKg.add(val);
                    }
                }
            }

            // final rounding
            return totalKg.setScale(4, RoundingMode.HALF_UP);
        } catch (Exception ex) {
            log.error("Error parsing uploaded file", ex);
            return BigDecimal.ZERO;
        }
    }

    // extract full text from uploaded file (not lowercased) for preview
    public String extractText(MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            AutoDetectParser parser = new AutoDetectParser();
            BodyContentHandler handler = new BodyContentHandler(-1);
            Metadata metadata = new Metadata();
            parser.parse(is, handler, metadata, new ParseContext());
            String text = handler.toString();
            return text == null ? "" : text.trim();
        } catch (Exception ex) {
            log.error("Error extracting text from file", ex);
            return "";
        }
    }

    /**
     * Estimate CO2 (kg) from explicit numeric fields provided in a form.
     */
    public BigDecimal estimateFromFields(BigDecimal distanceKm, BigDecimal energyKwh, BigDecimal liters, BigDecimal explicitCo2Kg) {
        BigDecimal totalKg = BigDecimal.ZERO;
        try {
            if (explicitCo2Kg != null) totalKg = totalKg.add(explicitCo2Kg);
            if (energyKwh != null) totalKg = totalKg.add(energyKwh.multiply(BigDecimal.valueOf(0.475)));
            if (distanceKm != null) totalKg = totalKg.add(distanceKm.multiply(BigDecimal.valueOf(0.21)));
            if (liters != null) totalKg = totalKg.add(liters.multiply(BigDecimal.valueOf(2.31)));
            return totalKg.setScale(4, RoundingMode.HALF_UP);
        } catch (Exception ex) {
            log.error("Error estimating from fields", ex);
            return BigDecimal.ZERO;
        }
    }

    // Check the uploaded document contains required journey sections (Vietnamese headings)
    public boolean hasRequiredJourneySections(MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            AutoDetectParser parser = new AutoDetectParser();
            BodyContentHandler handler = new BodyContentHandler(-1);
            Metadata metadata = new Metadata();
            parser.parse(is, handler, metadata, new ParseContext());

            String raw = handler.toString();
            if (raw == null) return false;

            // normalize and remove diacritics to allow matching variants
            String normalized = Normalizer.normalize(raw, Normalizer.Form.NFD)
                    .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                    .toLowerCase(Locale.ROOT);

            // look for Part I related phrases
            boolean hasPartI = (normalized.contains("phan i") || normalized.contains("phan1") || normalized.contains("phani") || normalized.contains("phần i"))
                    && (normalized.contains("thong tin chu so huu") || normalized.contains("thong tin") && normalized.contains("phuong tien") || normalized.contains("chu so huu") || normalized.contains("chủ sở hữu"));

            // look for Part II related phrases
            boolean hasPartII = (normalized.contains("phan ii") || normalized.contains("phan2") || normalized.contains("phanii") || normalized.contains("phần ii"))
                    && (normalized.contains("du lieu hanh trinh") || normalized.contains("hanh trinh tong hop") || (normalized.contains("du lieu") && normalized.contains("hanh trinh")) || normalized.contains("hành trình"));

            return hasPartI && hasPartII;
        } catch (Exception ex) {
            log.error("Error checking required journey sections", ex);
            return false;
        }
    }
}
