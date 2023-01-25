import os

import pytest
from playwright.sync_api import Page, expect


@pytest.fixture
def page(page: Page, base_url: str) -> Page:
    page.goto(base_url)
    page.locator('input[name="username"]').click()
    page.locator('input[name="username"]').fill(os.environ['test_username'])
    page.locator('input[name="username"]').press('Tab')
    page.locator('input[name="password"]').fill(os.environ['test_password'])
    with page.expect_navigation(wait_until='networkidle'):
        page.locator('text=Connexion').click()
    return page


def should_be_able_to_login(page: Page, base_url: str) -> None:
    expect(page).to_have_url(f'{base_url}/accueil')
    expect(page.locator("text=Une erreur s'est produite...")).to_have_count(0, timeout=100)


def should_display_production_sites(page: Page, base_url: str) -> None:
    page.locator('a:has-text("Sites de production")').click()
    expect(page).to_have_url(f'{base_url}/sitesProduction')
    page.locator('button:has-text("Rechercher")').click()


def should_display_limitations(page: Page, base_url: str) -> None:
    page.locator('a:has-text("Limitations")').click()
    expect(page).to_have_url(f'{base_url}/limitations')
    page.locator('button:has-text("Rechercher")').click()
    expect(page.locator("th[role=\"columnheader\"]:has-text(\"Filière\")")).to_be_visible(timeout=30000)
