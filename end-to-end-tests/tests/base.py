#! /usr/bin/env python
"""Collection of base classes."""

import os
import unittest

from selenium import webdriver


class TestCase(unittest.TestCase):
    """Base class for writing Selenium tests.

    Inherit this class to get common utility functions for writing Selenium
    based end to end tests.

    Reads value of target host and port from the operating system environment
    variables "TARGET_HOST" and "TARGET_PORT". Create them to override default
    value "localhost" for target host and "8080" for target port.
    """
    host = os.environ.get("TARGET_HOST", "localhost")
    port = os.environ.get("TARGET_PORT", "8080")
    domain = f"http://{host}:{port}"

    def setUp(self):
        self.driver = webdriver.Firefox()

    def get(self, relative_path):
        """Puts HTTP GET request to target

        This method is an wrapper over "driver.get()" method of selenium. This
        method allows requesting target with absolute path. The method
        constructs an absolute absolute path before putting actual request.
        """
        path = f"{self.domain}{relative_path}"
        return self.driver.get(path)

    def tearDown(self):
        self.driver.close()
