package com.hireflow.matching;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SkillNormalizationService {

    private final Map<String, String> synonymsMap = new HashMap<>();
    private final List<String> canonicalSkills = new ArrayList<>();

    public SkillNormalizationService() {
        initSkillTaxonomy();
    }

    private void initSkillTaxonomy() {
        addSkill("Java", List.of("java", "core java", "java 17", "java 21", "java 11", "java 8", "openjdk"));
        addSkill("Spring Boot", List.of("spring boot", "springboot", "spring boot 3", "spring-boot", "spring framework"));
        addSkill("PostgreSQL", List.of("postgresql", "postgres", "psql", "postgre"));
        addSkill("MySQL", List.of("mysql", "mariadb"));
        addSkill("React", List.of("react", "react.js", "reactjs", "react-dom"));
        addSkill("JavaScript", List.of("javascript", "js", "es6", "ecmascript"));
        addSkill("TypeScript", List.of("typescript", "ts"));
        addSkill("Docker", List.of("docker", "docker compose", "containerization", "containers"));
        addSkill("Kubernetes", List.of("kubernetes", "k8s"));
        addSkill("REST APIs", List.of("rest apis", "rest api", "restful", "rest services", "web services", "openapi", "swagger"));
        addSkill("Microservices", List.of("microservices", "microservice architecture", "distributed systems"));
        addSkill("Hibernate", List.of("hibernate", "spring data jpa", "jpa", "orm"));
        addSkill("Tailwind CSS", List.of("tailwind", "tailwindcss", "tailwind css"));
        addSkill("HTML/CSS", List.of("html", "html5", "css", "css3", "sass", "scss"));
        addSkill("Python", List.of("python", "python3", "django", "fastapi", "flask"));
        addSkill("AWS", List.of("aws", "amazon web services", "ec2", "s3", "lambda"));
        addSkill("CI/CD", List.of("ci/cd", "continuous integration", "github actions", "gitlab ci", "jenkins"));
        addSkill("Git", List.of("git", "github", "gitlab", "bitbucket"));
        addSkill("JUnit", List.of("junit", "junit 5", "mockito", "automated testing", "unit testing", "test driven development", "tdd"));
        addSkill("Redis", List.of("redis", "cache", "caching"));
        addSkill("Kafka", List.of("kafka", "apache kafka", "event streaming", "message broker"));
        addSkill("GraphQL", List.of("graphql", "apollo"));
    }

    private void addSkill(String canonical, List<String> variations) {
        canonicalSkills.add(canonical);
        synonymsMap.put(canonical.toLowerCase(), canonical);
        for (String var : variations) {
            synonymsMap.put(var.toLowerCase(), canonical);
        }
    }

    public String normalize(String skill) {
        if (skill == null || skill.isBlank()) return "";
        String clean = skill.trim().toLowerCase();
        return synonymsMap.getOrDefault(clean, skill.trim());
    }

    public Map<String, String> extractSkillsWithEvidence(String text) {
        Map<String, String> detectedSkills = new HashMap<>();
        if (text == null || text.isBlank()) return detectedSkills;

        String lowerText = text.toLowerCase();

        for (Map.Entry<String, String> entry : synonymsMap.entrySet()) {
            String variant = entry.getKey();
            String canonical = entry.getValue();

            // Word boundary match
            String regex = "\\b" + Pattern.quote(variant) + "\\b";
            Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(text);

            if (matcher.find()) {
                if (!detectedSkills.containsKey(canonical)) {
                    int start = Math.max(0, matcher.start() - 40);
                    int end = Math.min(text.length(), matcher.end() + 60);
                    String snippet = text.substring(start, end).replaceAll("\\s+", " ").trim();
                    detectedSkills.put(canonical, "..." + snippet + "...");
                }
            }
        }

        return detectedSkills;
    }
}
