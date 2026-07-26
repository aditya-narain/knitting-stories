package com.knittingstories.config;

import com.knittingstories.catalog.Category;
import com.knittingstories.catalog.CategoryRepository;
import com.knittingstories.catalog.Product;
import com.knittingstories.catalog.ProductImage;
import com.knittingstories.catalog.ProductRepository;
import com.knittingstories.catalog.ProductStatus;
import com.knittingstories.catalog.ProductVariant;
import com.knittingstories.user.Role;
import com.knittingstories.user.User;
import com.knittingstories.user.UserRepository;
import com.knittingstories.user.UserStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Seeds demo data (categories, a seller, a customer and a catalog of crochet
 * products) on first startup so the storefront is populated out of the box.
 * Disabled under the "test" profile and wherever app.seed-demo-data is false,
 * which includes every deployed environment.
 */
@Component
@Profile("!test")
@ConditionalOnProperty(name = "app.seed-demo-data", havingValue = "true", matchIfMissing = true)
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, CategoryRepository categoryRepository,
                      ProductRepository productRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }
        log.info("Seeding demo data for Knitting Stories...");

        User seller = user("seller@knittingstories.test", "Priya Menon", Role.SELLER, "Knots & Whimsy");
        User customer = user("customer@knittingstories.test", "Ananya Rao", Role.CUSTOMER, null);
        userRepository.saveAll(List.of(seller, customer));

        Map<String, Category> cats = Map.of(
                "blankets", category("Blankets & Throws", "blankets", "Cosy handmade blankets and throws"),
                "toys", category("Amigurumi & Toys", "toys", "Adorable crocheted plush toys"),
                "accessories", category("Accessories", "accessories", "Beanies, scarves and more"),
                "bags", category("Bags", "bags", "Handcrafted totes and market bags"),
                "baby", category("Baby", "baby", "Gentle handmade pieces for little ones"),
                "decor", category("Home Decor", "decor", "Wall hangings, coasters and cosy touches")
        );
        categoryRepository.saveAll(cats.values());

        productRepository.saveAll(List.of(
                product(seller, cats.get("blankets"), "Granny Square Heirloom Blanket",
                        "A timeless multi-colour granny square throw, hand-crocheted in soft acrylic-cotton blend. "
                                + "Perfect for cosy evenings and a lovely heirloom gift.",
                        new BigDecimal("2499"), true, 4.8, 24,
                        List.of("/products/granny-blanket-1.svg", "/products/granny-blanket-2.svg"),
                        List.of(
                                variant("KS-BLK-GS-SM", "Small (90x90 cm)", "Multi", "Small", "2499", 8),
                                variant("KS-BLK-GS-LG", "Large (150x180 cm)", "Multi", "Large", "3999", 5))),

                product(seller, cats.get("toys"), "Amigurumi Bunny Plush",
                        "A huggable crochet bunny with embroidered features and a little bow. "
                                + "Made with baby-safe cotton yarn and hypoallergenic stuffing.",
                        new BigDecimal("899"), true, 4.9, 41,
                        List.of("/products/bunny-1.svg"),
                        List.of(
                                variant("KS-TOY-BUN-CR", "Cream Bunny", "Cream", "One size", "899", 15),
                                variant("KS-TOY-BUN-PK", "Blush Pink Bunny", "Blush Pink", "One size", "899", 12))),

                product(seller, cats.get("accessories"), "Chunky Knit Beanie",
                        "A warm, chunky ribbed beanie with a faux-fur pom. Stretchy fit for all-day comfort.",
                        new BigDecimal("649"), false, 4.6, 18,
                        List.of("/products/beanie-1.svg"),
                        List.of(
                                variant("KS-ACC-BEA-MU", "Mustard", "Mustard", "One size", "649", 20),
                                variant("KS-ACC-BEA-GR", "Sage Green", "Sage Green", "One size", "649", 14),
                                variant("KS-ACC-BEA-CH", "Charcoal", "Charcoal", "One size", "649", 9))),

                product(seller, cats.get("bags"), "Boho Crochet Tote Bag",
                        "A roomy everyday tote with sturdy handles and a playful open-weave pattern. "
                                + "Fully lined so nothing slips through.",
                        new BigDecimal("1299"), true, 4.7, 12,
                        List.of("/products/tote-1.svg"),
                        List.of(
                                variant("KS-BAG-TOT-TN", "Natural Tan", "Tan", "Standard", "1299", 10),
                                variant("KS-BAG-TOT-TE", "Teal", "Teal", "Standard", "1349", 6))),

                product(seller, cats.get("baby"), "Baby Booties & Mittens Set",
                        "A gift-ready set of soft booties and mittens in gender-neutral tones. "
                                + "Gentle on delicate skin.",
                        new BigDecimal("749"), false, 5.0, 9,
                        List.of("/products/booties-1.svg"),
                        List.of(
                                variant("KS-BBY-SET-CR", "Cream (0-6 m)", "Cream", "0-6 months", "749", 18),
                                variant("KS-BBY-SET-SG", "Sage (0-6 m)", "Sage", "0-6 months", "749", 11))),

                product(seller, cats.get("decor"), "Boho Macrame-Style Wall Hanging",
                        "A statement crochet wall hanging with tassels and a natural wooden dowel. "
                                + "Adds warm boho texture to any room.",
                        new BigDecimal("1599"), false, 4.5, 7,
                        List.of("/products/wallhanging-1.svg"),
                        List.of(
                                variant("KS-DEC-WAL-NA", "Natural", "Natural", "60 cm wide", "1599", 5))),

                product(seller, cats.get("decor"), "Floral Coasters (Set of 4)",
                        "A set of four cheerful floral coasters in cotton yarn. Washable and heat-friendly.",
                        new BigDecimal("499"), false, 4.4, 15,
                        List.of("/products/coasters-1.svg"),
                        List.of(
                                variant("KS-DEC-COA-MX", "Mixed Florals", "Multi", "Set of 4", "499", 25))),

                product(seller, cats.get("bags"), "Cotton Market Bag",
                        "A lightweight, endlessly stretchy market bag that folds away small and carries a lot. "
                                + "Your reusable everyday companion.",
                        new BigDecimal("599"), false, 4.6, 21,
                        List.of("/products/marketbag-1.svg"),
                        List.of(
                                variant("KS-BAG-MKT-EC", "Ecru", "Ecru", "Standard", "599", 30),
                                variant("KS-BAG-MKT-TR", "Terracotta", "Terracotta", "Standard", "599", 22)))
        ));

        log.info("Seeded {} products.", productRepository.count());
    }

    private User user(String email, String name, Role role, String shop) {
        User u = new User();
        u.setEmail(email);
        u.setFullName(name);
        u.setRole(role);
        u.setStatus(UserStatus.ACTIVE);
        u.setShopName(shop);
        u.setPasswordHash(passwordEncoder.encode("Password123"));
        return u;
    }

    private Category category(String name, String slug, String description) {
        Category c = new Category();
        c.setName(name);
        c.setSlug(slug);
        c.setDescription(description);
        return c;
    }

    private Product product(User seller, Category category, String title, String description,
                            BigDecimal basePrice, boolean featured, double rating, int ratingCount,
                            List<String> imageUrls, List<ProductVariant> variants) {
        Product p = new Product();
        p.setSeller(seller);
        p.setCategory(category);
        p.setTitle(title);
        p.setDescription(description);
        p.setBasePrice(basePrice);
        p.setStatus(ProductStatus.ACTIVE);
        p.setFeatured(featured);
        p.setRatingAvg(BigDecimal.valueOf(rating));
        p.setRatingCount(ratingCount);
        int pos = 0;
        for (String url : imageUrls) {
            ProductImage img = new ProductImage();
            img.setUrl(url);
            img.setPosition(pos++);
            p.addImage(img);
        }
        for (ProductVariant v : variants) {
            p.addVariant(v);
        }
        return p;
    }

    private ProductVariant variant(String sku, String name, String color, String size,
                                   String price, int stock) {
        ProductVariant v = new ProductVariant();
        v.setSku(sku);
        v.setName(name);
        v.setColor(color);
        v.setSize(size);
        v.setPrice(new BigDecimal(price));
        v.setStock(stock);
        return v;
    }
}
