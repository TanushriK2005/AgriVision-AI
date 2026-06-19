def get_market_price(crop):

    crop = crop.lower()

    market_prices = {
        "rice": {
            "price": "₹3200/quintal",
            "trend": "Up",
            "recommendation": "Good time to sell"
        },
        "wheat": {
            "price": "₹2400/quintal",
            "trend": "Stable",
            "recommendation": "Market stable"
        },
        "maize": {
            "price": "₹2100/quintal",
            "trend": "Up",
            "recommendation": "Good time to sell"
        },
        "cotton": {
            "price": "₹6800/quintal",
            "trend": "Down",
            "recommendation": "Consider holding stock"
        },
        "sugarcane": {
            "price": "₹350/quintal",
            "trend": "Stable",
            "recommendation": "Market stable"
        }
    }

    if crop in market_prices:
        return market_prices[crop]

    return {
        "price": "Not Available",
        "trend": "Unknown",
        "recommendation": "No data available"
    }
