package com.email.email_writer_sb;


import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class EmailRequest {
    private String emailContent;
    private String tone;
}
