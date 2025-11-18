package com.example.demo.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "dispute_exchange";
    public static final String QUEUE_NAME = "dispute_notification_queue";
    public static final String ROUTING_KEY = "dispute.created";

    // 1. Định nghĩa Exchange (Vẫn giữ)
    @Bean
    public TopicExchange disputeExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    // 2. Định nghĩa Queue (Vẫn giữ)
    @Bean
    public Queue disputeNotificationQueue() {
        return new Queue(QUEUE_NAME, true); // durable = true
    }

    // 3. Định nghĩa Binding (Vẫn giữ)
    @Bean
    public Binding binding(Queue disputeNotificationQueue, TopicExchange disputeExchange) {
        return BindingBuilder.bind(disputeNotificationQueue)
                             .to(disputeExchange)
                             .with(ROUTING_KEY);
    }

    // 4. Cấu hình Message Converter (Vẫn giữ)
    // Spring Boot sẽ TỰ ĐỘNG tìm bean này và áp dụng cho RabbitTemplate
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}