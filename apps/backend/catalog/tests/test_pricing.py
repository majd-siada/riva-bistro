from decimal import Decimal

from catalog.pricing import price_from_ex_vat, price_from_inc_vat


def test_price_from_ex_vat():
    result = price_from_ex_vat(Decimal("100"))
    assert result["price_ex_vat"] == "100.00"
    assert result["vat_amount"] == "25.00"
    assert result["price_inc_vat"] == "125.00"


def test_price_from_inc_vat():
    result = price_from_inc_vat(Decimal("125"))
    assert result["price_inc_vat"] == "125.00"
    assert result["price_ex_vat"] == "100.00"
    assert result["vat_amount"] == "25.00"
