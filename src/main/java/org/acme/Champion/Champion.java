package org.acme.Champion;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;

@Entity // @어노테이션, 엔티티는 테이블
public class Champion extends PanacheEntity {
    public String name;  // 챔피언 이름
    public String role;  // 역할 (전사, 마법사 등)
    public String line;  // 라인 (탑, 미드 등)
}