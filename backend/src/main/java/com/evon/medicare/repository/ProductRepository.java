package com.evon.medicare.repository;

import com.evon.medicare.entity.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {

    List<Product> findByCategory(String category);

    List<Product> findByCategoryIgnoreCase(String category);

    long countByCategory(String category);
}
