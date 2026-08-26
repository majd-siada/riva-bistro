from decimal import Decimal, ROUND_HALF_UP

VAT_RATE_DEFAULT = Decimal("0.25")
TWO_PLACES = Decimal("0.01")


def quantize(value: Decimal) -> Decimal:
    return value.quantize(TWO_PLACES, rounding=ROUND_HALF_UP)


def price_from_ex_vat(amount_ex_vat: Decimal, vat_rate: Decimal = VAT_RATE_DEFAULT) -> dict:
    """Calculate VAT breakdown from ex-VAT price."""
    ex = quantize(amount_ex_vat)
    vat = quantize(ex * vat_rate)
    inc = quantize(ex + vat)
    return {
        "price_ex_vat": str(ex),
        "vat_amount": str(vat),
        "price_inc_vat": str(inc),
        "vat_rate": str(vat_rate),
    }


def price_from_inc_vat(amount_inc_vat: Decimal, vat_rate: Decimal = VAT_RATE_DEFAULT) -> dict:
    """Calculate VAT breakdown from inc-VAT price."""
    inc = quantize(amount_inc_vat)
    ex = quantize(inc / (1 + vat_rate))
    vat = quantize(inc - ex)
    return {
        "price_ex_vat": str(ex),
        "vat_amount": str(vat),
        "price_inc_vat": str(inc),
        "vat_rate": str(vat_rate),
    }
