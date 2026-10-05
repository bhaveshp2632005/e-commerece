package com.evon.medicare.service;

import com.evon.medicare.dto.ProductDTO;
import com.evon.medicare.entity.Product;
import com.evon.medicare.exception.ResourceNotFoundException;
import com.evon.medicare.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;

    /** Get all products, optionally filtered by category */
    public List<ProductDTO.Response> getAllProducts(String category) {
        List<Product> products = (category == null || category.equalsIgnoreCase("all"))
                ? productRepository.findAll()
                : productRepository.findByCategoryIgnoreCase(category);
        return products.stream().map(this::toResponse).toList();
    }

    /** Get single product by ID */
    public ProductDTO.Response getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        return toResponse(product);
    }

    /** Create a new product */
    public ProductDTO.Response createProduct(ProductDTO.Request request) {
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .originalPrice(request.getOriginalPrice() != null ? request.getOriginalPrice() : request.getPrice())
                .category(request.getCategory())
                .image(request.getImage())
                .stock(request.getStock() != null ? request.getStock() : 100)
                .build();
        product = productRepository.save(product);
        log.info("✅ Product created: {}", product.getName());
        return toResponse(product);
    }

    /** Update existing product */
    public ProductDTO.Response updateProduct(String id, ProductDTO.Request request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setOriginalPrice(request.getOriginalPrice() != null ? request.getOriginalPrice() : request.getPrice());
        product.setCategory(request.getCategory());
        product.setImage(request.getImage());
        if (request.getStock() != null) product.setStock(request.getStock());

        product = productRepository.save(product);
        log.info("✅ Product updated: {}", product.getId());
        return toResponse(product);
    }

    /** Delete product */
    public void deleteProduct(String id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product", id);
        }
        productRepository.deleteById(id);
        log.info("✅ Product deleted: {}", id);
    }

    /** Seed initial sample products (idempotent) */
    public String initProducts() {
        long count = productRepository.count();
        if (count > 0) {
            return "Products already initialized. Count: " + count;
        }

        List<Product> products = List.of(
            // ── Fever & Pain ────────────────────────────────────────────────
            buildProduct("Paracetamol 500mg",
                "Effective pain reliever and fever reducer. Safe for adults and children above 12 years.",
                20.00, 28.00, "fever",
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80"),
            buildProduct("Ibuprofen 400mg",
                "Powerful anti-inflammatory drug for pain, fever, and inflammation relief.",
                35.00, 45.00, "fever",
                "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&q=80"),
            buildProduct("Aspirin 75mg",
                "Low-dose aspirin for blood thinning and heart protection. Doctor recommended.",
                55.00, 70.00, "fever",
                "https://images.unsplash.com/photo-1550572017-4bca0352c39a?w=500&q=80"),
            buildProduct("Diclofenac Gel 30g",
                "Topical pain relief gel for muscle pain, joint pain, and arthritis.",
                95.00, 120.00, "fever",
                "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500&q=80"),

            // ── Cold & Cough ─────────────────────────────────────────────────
            buildProduct("Cetirizine 10mg",
                "Non-drowsy antihistamine for allergy relief, runny nose, and sneezing.",
                45.00, 55.00, "cold",
                "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500&q=80"),
            buildProduct("Cough Syrup 100ml",
                "Herbal cough syrup with tulsi, honey, and ginger for dry and wet cough relief.",
                85.00, 100.00, "cold",
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80"),
            buildProduct("Amoxicillin 500mg",
                "Broad spectrum antibiotic for respiratory infections. Prescription required.",
                120.00, 150.00, "cold",
                "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&q=80"),
            buildProduct("Nasal Spray 10ml",
                "Saline nasal spray for instant relief from blocked nose and nasal congestion.",
                110.00, 135.00, "cold",
                "https://images.unsplash.com/photo-1550572017-4bca0352c39a?w=500&q=80"),

            // ── Digestive Health ─────────────────────────────────────────────
            buildProduct("Omeprazole 20mg",
                "Proton pump inhibitor for acid reflux, heartburn, and gastric ulcers.",
                60.00, 75.00, "stomach",
                "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&q=80"),
            buildProduct("Antacid Tablets",
                "Fast-acting chewable tablets for instant relief from acidity and indigestion.",
                40.00, 50.00, "stomach",
                "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500&q=80"),
            buildProduct("Probiotics 10 Billion CFU",
                "Multi-strain probiotics to restore gut flora and improve digestive health.",
                280.00, 330.00, "stomach",
                "https://images.unsplash.com/photo-1550572017-4bca0352c39a?w=500&q=80"),
            buildProduct("Loperamide 2mg",
                "Fast relief from diarrhea. Reduces stool frequency and improves stool consistency.",
                35.00, 45.00, "stomach",
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80"),

            // ── Vitamins & Supplements ───────────────────────────────────────
            buildProduct("Vitamin D3 2000IU",
                "Essential vitamin for bone health, immunity, and mood regulation.",
                280.00, 340.00, "vitamins",
                "https://images.unsplash.com/photo-1550572017-4bca0352c39a?w=500&q=80"),
            buildProduct("Multivitamin Tablets (30)",
                "Complete daily nutrition with 25+ essential vitamins, minerals, and antioxidants.",
                350.00, 420.00, "vitamins",
                "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&q=80"),
            buildProduct("Vitamin C 1000mg Effervescent",
                "High-dose Vitamin C with zinc for powerful immune system boost.",
                199.00, 250.00, "vitamins",
                "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500&q=80"),
            buildProduct("Omega-3 Fish Oil 1000mg",
                "Premium fish oil capsules for heart health, brain function, and joint support.",
                450.00, 550.00, "vitamins",
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80"),
            buildProduct("Biotin 10000mcg",
                "High potency biotin for hair growth, stronger nails, and glowing skin.",
                320.00, 390.00, "vitamins",
                "https://images.unsplash.com/photo-1550572017-4bca0352c39a?w=500&q=80"),

            // ── Skincare ─────────────────────────────────────────────────────
            buildProduct("Antiseptic Cream 50g",
                "Prevents infection in minor cuts, burns, wounds, and abrasions.",
                75.00, 95.00, "skincare",
                "https://images.unsplash.com/photo-1556228852-80a1b36a1e9e?w=500&q=80"),
            buildProduct("Sunscreen SPF 50+ PA+++",
                "Broad spectrum UVA/UVB protection with lightweight, non-greasy formula.",
                450.00, 550.00, "skincare",
                "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&q=80"),
            buildProduct("Moisturizing Lotion 200ml",
                "Deep hydrating lotion with ceramides for dry, sensitive, and normal skin.",
                320.00, 380.00, "skincare",
                "https://images.unsplash.com/photo-1556228852-80a1b36a1e9e?w=500&q=80"),
            buildProduct("Calamine Lotion 100ml",
                "Soothing lotion for itching, rashes, prickly heat, and minor skin irritations.",
                85.00, 110.00, "skincare",
                "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&q=80"),

            // ── Medical Equipment ─────────────────────────────────────────────
            buildProduct("Digital Thermometer",
                "Fast 10-second reading digital thermometer with fever alert and memory recall.",
                199.00, 250.00, "equipment",
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80"),
            buildProduct("Blood Pressure Monitor",
                "Automatic upper arm BP monitor with irregular heartbeat detection and memory.",
                1299.00, 1599.00, "equipment",
                "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=500&q=80"),
            buildProduct("Pulse Oximeter",
                "Fingertip pulse oximeter to measure blood oxygen saturation (SpO2) and pulse rate.",
                599.00, 799.00, "equipment",
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80"),
            buildProduct("Glucometer Kit",
                "Blood glucose monitoring kit with 25 test strips and lancets included.",
                899.00, 1199.00, "equipment",
                "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=500&q=80"),
            buildProduct("Nebulizer Machine",
                "Compressor nebulizer for asthma, COPD, and respiratory condition treatment.",
                1599.00, 2099.00, "equipment",
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80"),
            buildProduct("First Aid Kit (25 pieces)",
                "Complete emergency first aid kit with bandages, antiseptics, and essentials.",
                349.00, 450.00, "equipment",
                "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=500&q=80")
        );

        productRepository.saveAll(products);
        log.info("✅ {} products initialized", products.size());
        return "Products initialized successfully. Count: " + products.size();
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private Product buildProduct(String name, String description, double price,
                                  double originalPrice, String category, String image) {
        return Product.builder()
                .name(name).description(description)
                .price(java.math.BigDecimal.valueOf(price))
                .originalPrice(java.math.BigDecimal.valueOf(originalPrice))
                .category(category).image(image).stock(100)
                .build();
    }

    public ProductDTO.Response toResponse(Product p) {
        return ProductDTO.Response.builder()
                .id(p.getId()).name(p.getName()).description(p.getDescription())
                .price(p.getPrice()).originalPrice(p.getOriginalPrice())
                .category(p.getCategory()).image(p.getImage())
                .stock(p.getStock()).createdAt(p.getCreatedAt())
                .build();
    }
}
