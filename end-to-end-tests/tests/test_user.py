#! /usr/bin/env python

"""Functional tests of User."""

import unittest
import os


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
