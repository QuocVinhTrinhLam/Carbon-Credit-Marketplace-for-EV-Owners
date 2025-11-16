package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "wallet", uniqueConstraints = @UniqueConstraint(columnNames = "user_id"))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal balance = BigDecimal.ZERO;   // chính xác số học

    // ✅ Liên kết 1-1 với User
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonBackReference // ánh xạ ngược với @JsonManagedReference bên User
    private User user;

    // ✅ Danh sách giao dịch của ví
    @OneToMany(mappedBy = "wallet", cascade = CascadeType.ALL)
    private List<WalletTransaction> walletTransactions;
}
