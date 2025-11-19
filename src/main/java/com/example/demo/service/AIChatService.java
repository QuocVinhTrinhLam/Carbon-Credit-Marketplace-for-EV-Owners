package com.example.demo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AIChatService {

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${openrouter.api.endpoint}")
    private String endpoint;

    @Value("${openrouter.api.model}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();
    private final PriceAnalyticsService priceAnalyticsService;

    // ============================================================
    // HÀM CHÍNH — XỬ LÝ LOGIC CHAT
    // ============================================================
    public String ask(String msg) {

        if (msg == null) msg = "";
        String lower = msg.toLowerCase().trim();

        Double avg = nvl(priceAnalyticsService.getAveragePrice());
        Double min = nvl(priceAnalyticsService.getMinPrice());
        Double max = nvl(priceAnalyticsService.getMaxPrice());
        Double suggested = nvl(priceAnalyticsService.getSuggestedPrice());

        boolean hasData = avg > 0;

        // ====================================================
        // 1) ƯU TIÊN NHÁNH "GỢI Ý GIÁ BÁN"
        // ====================================================
        boolean askSuggest =
                lower.contains("gợi ý") ||
                lower.contains("nên bán") ||
                lower.contains("giá hợp lý") ||
                lower.contains("bán bao nhiêu") ||
                lower.contains("đề xuất");

        if (askSuggest) {
            if (!hasData) {
                return """
                    Hiện tại hệ thống chưa có dữ liệu thật.
                    Gợi ý giá bán hợp lý theo thị trường quốc tế là **100 USD/tấn**.
                    """;
            }

            return """
                Dựa trên dữ liệu giao dịch thật:
                • Giá trung bình: %s USD/tấn
                → Giá bán hợp lý nhất: **%s USD/tấn**.
                """.formatted(format(avg), format(suggested));
        }

        // ====================================================
        // 2) GIÁ CARBON HÔM NAY
        // ====================================================
        boolean askTodayPrice =
                lower.contains("giá") ||
                lower.contains("hôm nay") ||
                lower.contains("bao nhiêu") ||
                lower.contains("giá bao nhiêu") ||
                lower.contains("nhiêu");

        if (askTodayPrice) {
            if (!hasData) {
                return """
                    Hiện tại hệ thống chưa có dữ liệu giao dịch thật.
                    Giá carbon thị trường quốc tế dao động **80–120 USD/tấn**.
                    """;
            }

            return """
                Dựa trên dữ liệu giao dịch thật trong hệ thống:
                • Thấp nhất: %s USD/tấn
                • Trung bình: %s USD/tấn
                • Cao nhất: %s USD/tấn
                """.formatted(format(min), format(avg), format(max));
        }


        // ====================================================
        // 3) CÂU HỎI KHÁC → GỌI AI
        // ====================================================
        return safeAI(msg, "Dữ liệu hệ thống: avg=" + avg + ", suggested=" + suggested);
    }



    // ============================================================
    // SAFE AI (không crash)
    // ============================================================
    private String safeAI(String userMessage, String systemInfo) {
        try {
            return callAI(userMessage, systemInfo);
        } catch (Exception e) {
            return "Mình chưa hiểu ý bạn, bạn thử nói lại giúp mình nhé! 😊";
        }
    }


    // ============================================================
    // GỌI OPENROUTER API
    // ============================================================
    private String callAI(String userMessage, String systemInfo) {

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", systemInfo),
                        Map.of("role", "user", "content", userMessage)
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<Map> res = restTemplate.exchange(endpoint, HttpMethod.POST, request, Map.class);

        List choices = (List) res.getBody().get("choices");
        Map first = (Map) choices.get(0);
        Map msg = (Map) first.get("message");

        return msg.get("content").toString();
    }


    // ============================================================
    // UTILS
    // ============================================================
    private Double nvl(Double v) {
        return v == null ? 0.0 : v;
    }

    private String format(Double v) {
        return String.format("%.2f", v);
    }
}
