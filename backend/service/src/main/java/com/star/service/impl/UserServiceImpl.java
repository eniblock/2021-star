package com.star.service.impl;

import com.star.service.UserService;

//@Service
public class UserServiceImpl implements UserService {
    @Override
    public String getUserName() {
            return "User test";
    }
}
