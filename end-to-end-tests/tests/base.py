#! /usr/bin/env python
"""Collection of base classes."""

import os
import unittest

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions



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

    def port_scan(self, start, end, wait=120):
        """Runs Port scanning

        Use this method to fill the form with desired values and start the port
        scanning process. Default wait time for scanning process to complete is
        100 seconds. Override it if the process is expected to wait for longer
        time.

        The method is returned when the port scanning process is ended.  The
        method will observe the "status" label HTML element and when it is
        texted as "Finished", this method assumes the port scanning process has
        ended.

        Parameters:
            start : Port value from which the tool will initiate a scan. It
            should be between 0 to 65535.
            end   : Port value to which the tool will scan the process. It
            should be between 0 to 65535.
            wait  : Expected wait time until the scanning process will end.
        """
        self.get("/")
        start_port_element = self.driver.find_element_by_xpath(
            '//*[@id="start-port"]'
        )
        end_port_element = self.driver.find_element_by_xpath(
            '//*[@id="end-port"]'
        )
        start_stop_button = self.driver.find_element_by_xpath(
            '//*[@id="btn-discover"]'
        )

        start_port_element.send_keys("27010")
        end_port_element.send_keys("27030")
        start_stop_button.click()

        secounds = 120
        wait = WebDriverWait(self.driver, secounds)
        status = wait.until(
            expected_conditions.text_to_be_present_in_element(
                (By.ID, 'status'),
                "Finished"
            )
        )

    def assert_port_in_result(self, port, description):
        """Asserts port and value in scanned result

        Preferred method to call after calling `self.port_scan() method.

        Parameters:
            port        : Desired port value that should be in list of ports
            detected.
            description : Description value that should be in list of
            description.
        """
        port_elements = self.driver.find_elements_by_xpath(
            "/html/body/div[2]/div[3]/div/div/table/tbody/tr/td[1]"
        )
        description_elements = self.driver.find_elements_by_xpath(
            "/html/body/div[2]/div[3]/div/div/table/tbody/tr/td[2]"
        )

        ports = list(map(lambda r: r.text, port_elements))
        descriptions = list(map(lambda d: d.text, description_elements))

        self.assertIn(
            str(port),
            ports,
            "Desired port do not found in scanned result"
        )
        self.assertIn(
            str(description),
            descriptions,
            "Desired description do not found in description result"
        )

    def tearDown(self):
        self.driver.close()
