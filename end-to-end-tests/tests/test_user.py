#! /usr/bin/env python

"""Functional tests of User."""

import unittest
import os

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions

from . import base


class TestNameAndDescription(base.TestCase):
    """Name of the tool and purpose should be noticed by User."""

    def setUp(self):
        super().setUp()
        self.get("/")

    def test_title(self):
        self.assertEqual(
            self.driver.title,
            "Javascript based Port scanning tool"
        )

    def test_heading(self):
        heading_element = self.driver.find_element_by_xpath(
            "/html/body/div[1]/h1"
        )
        self.assertEqual(
            heading_element.text,
            "Port scanner 👁️"
        )

    def test_description(self):
        description_element = self.driver.find_element_by_css_selector(
            "html body div.text-center p.lead.text-secondary"
        )
        self.assertEqual(
            description_element.text,
            ("Demonstrates possible attack to fingerprint user by scanning "
             "running services using pure Javascript.")
        )


class TestScanForNoServices(base.TestCase):

    def test_starting_ending_service_for_css_changies(self):
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
        scan_status = self.driver.find_element_by_xpath(
            '//*[@id="status"]'
        )

        self.assertEqual(scan_status.text, "Not running")
        self.assertEqual(
            scan_status.get_attribute("class"),
            "badge badge-secondary"
        )

        self.assertEqual(start_stop_button.text, "Discover")
        self.assertEqual(
            start_stop_button.get_attribute("class"),
            "btn btn-primary"
        )

        start_port_element.send_keys("8050")
        end_port_element.send_keys("8150")
        start_stop_button.click()

        self.assertEqual(scan_status.text, "Scanning")
        self.assertEqual(
            scan_status.get_attribute("class"),
            "badge badge-success"
        )

        self.assertEqual(
            start_stop_button.text,
            "Stop"
        )
        self.assertEqual(
            start_stop_button.get_attribute("class"),
            "btn btn-danger"
        )

        secounds = 20
        wait = WebDriverWait(self.driver, secounds)
        status = wait.until(
            expected_conditions.text_to_be_present_in_element(
                (By.ID, 'status'),
                "Finished"
            )
        )

        self.assertEqual(
            scan_status.get_attribute("class"),
            "badge badge-secondary"
        )

        self.assertEqual(start_stop_button.text, "Discover")
        self.assertEqual(
            start_stop_button.get_attribute("class"),
            "btn btn-primary"
        )

    def test_start_scanning_process(self):
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

        start_port_element.send_keys("8050")
        end_port_element.send_keys("8053")
        start_stop_button.click()

        table_element = self.driver.find_element_by_xpath(
            '/html/body/div[2]/div[3]/div/div/table/tbody'
        )
        port_entries = table_element.find_elements_by_xpath(".//*")

        self.assertEqual(
            0,
            len(port_entries),
            (
                "Table of discovered ports should be empty because scanning "
                "has not started."
            )
        )
        secounds = 120
        wait = WebDriverWait(self.driver, secounds)
        status = wait.until(
            expected_conditions.text_to_be_present_in_element(
                (By.ID, 'status'),
                "Finished"
            )
        )

        self.assertEqual(
            0,
            len(port_entries),
            (
                "Table of discovered ports should be empty because no "
                "services are running between those port ranges."
            )
        )


class TestRunningMongo(base.TestCase):
    """Test running Mongo service is detected."""

    def test_mongo_service_detection(self):
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

        table_element = self.driver.find_element_by_xpath(
            '/html/body/div[2]/div[3]/div/div/table/tbody'
        )
        port_entries = table_element.find_elements_by_xpath(".//*")

        self.assertEqual(
            0,
            len(port_entries),
            (
                "Table of discovered ports should be empty because scanning "
                "has not started."
            )
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

        port, description = table_element.find_elements_by_xpath(".//td")

        self.assertEqual(
            port.text,
            "27017"
        )

        self.assertEqual(
            description.text,
            "Mongo database system",
        )
