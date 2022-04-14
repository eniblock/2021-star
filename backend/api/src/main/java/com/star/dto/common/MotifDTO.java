package com.star.dto.common;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MotifDTO {

    private String messageType;
    private String businessType;
    private String reasonCode;

}
