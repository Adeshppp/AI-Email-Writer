package com.email.email_writer_sb;


import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
@AllArgsConstructor
@CrossOrigin(origins =  "*")
public class EmailGeneratorController {

    @Autowired
    private final EmailGeneratorService emailGeneratorService;

    @PostMapping("/generate")
    public ResponseEntity<String> generateEmail(@RequestBody EmailRequest emailRequest, HttpServletRequest request) {

        String authHeader = request.getHeader("Authorization");
        if(authHeader == null || !authHeader.startsWith("Bearer ")){
            return ResponseEntity.status(401).body("Unauthorized: API key is missing or invalid.");
        }

        String apiKey = authHeader.substring(7);
        System.out.println("Received API Key: " + apiKey); // Debugging: Print API key

        String response  = emailGeneratorService.generateEmailReply(emailRequest, apiKey);
        return ResponseEntity.ok(response);
    }
}
