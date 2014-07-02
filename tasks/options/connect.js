// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
"use strict";

module.exports = {
    localhost: {
        options: {
            port: 9666,
            keepalive: true,
            open: {
                target: 'http://localhost:9666/bin/tests/tests.html'
            },
            hostname: 'localhost'
        }
    },
    saucelabs: {
        options: {
            base: "",
            port: 9999,
            hostname: 'localhost'
        }
    },
    remote: {
        options: {
            port: 9666,
            keepalive: true,
            open: {
                target: 'http://localhost:9666/bin/tests/tests.html'
            },
            hostname: '*'
        }
    }
};