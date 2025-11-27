package com.example.demo.security;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.demo.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        try {
            String jwt = getJwtFromRequest(request);
            String path = request.getRequestURI();

            if (StringUtils.hasText(jwt)) {
                log.debug("JWT found for path: {}", path);
                
                if (jwtUtil.validateToken(jwt)) {
                    String email = jwtUtil.extractEmail(jwt);
                    Long userId = jwtUtil.extractUserId(jwt);
                    List<String> roles = jwtUtil.extractRoles(jwt);

                    log.debug("JWT valid - email: {}, userId: {}, roles: {}", email, userId, roles);

                    // Verify user exists in database
                    var userOpt = userRepository.findByEmail(email);
                    if (userOpt.isPresent()) {
                        List<SimpleGrantedAuthority> authorities = roles.stream()
                                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                                .collect(Collectors.toList());

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(email, null, authorities);
                        
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        
                        // Set userId in authentication details for easy access
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        
                        log.debug("Set Authentication for user: {} with roles: {}", email, roles);
                    } else {
                        log.warn("User not found in database for email: {}", email);
                    }
                } else {
                    log.warn("JWT validation failed for path: {}", path);
                }
            } else {
                log.debug("No JWT found in Authorization header for path: {}", path);
            }
        } catch (Exception ex) {
            log.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}

