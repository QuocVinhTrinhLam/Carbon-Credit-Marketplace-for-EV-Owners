package com.example.demo.service;

import com.example.demo.repository.ListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PriceAnalyticsService {

    private final ListingRepository listingRepository;

    public Double getAveragePrice() {
        return listingRepository.getAveragePrice();
    }

    public Double getMinPrice() {
        return listingRepository.getMinPrice();
    }

    public Double getMaxPrice() {
        return listingRepository.getMaxPrice();
    }

    /**
     * Giá đề xuất: hơi cao hơn trung bình nhưng vẫn trong khoảng min–max.
     * Bạn có thể chỉnh công thức nếu muốn “tham” hơn hoặc “dễ bán” hơn.
     */
    public Double getSuggestedPrice() {
        Double avg = getAveragePrice();
        Double min = getMinPrice();
        Double max = getMaxPrice();

        if (avg == null) return null;
        if (min == null || max == null) return avg;

        double suggested = avg * 1.05; // +5% so với trung bình
        if (suggested > max) suggested = max;
        if (suggested < min) suggested = avg; // fallback

        return suggested;
    }
}
