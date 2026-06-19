def recommend_fertilizer(N, P, K):

    if N < 50:
        return {
            "fertilizer": "Urea",
            "reason": "Nitrogen level is low."
        }

    elif P < 50:
        return {
            "fertilizer": "DAP",
            "reason": "Phosphorus level is low."
        }

    elif K < 50:
        return {
            "fertilizer": "MOP",
            "reason": "Potassium level is low."
        }

    else:
        return {
            "fertilizer": "NPK 19:19:19",
            "reason": "Soil nutrients are balanced."
        }
