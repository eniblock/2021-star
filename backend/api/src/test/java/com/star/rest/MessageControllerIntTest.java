package com.star.rest;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class MessageControllerIntTest extends AbstractIntTest {

    @Test
    public void testAdminMessage() throws Exception {
        // GIVEN

        // WHEN

        // THEN
        mockMvc.perform(MockMvcRequestBuilders.get(MessageController.PATH + "/admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value(Matchers.containsString("admin")));
    }


    @Test
    public void testManagerMessage() throws Exception {
        // GIVEN

        // WHEN

        // THEN
        mockMvc.perform(MockMvcRequestBuilders.get(MessageController.PATH + "/manager"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value(Matchers.containsString("manager")));
    }

}
