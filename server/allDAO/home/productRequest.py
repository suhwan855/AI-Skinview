from pydantic import BaseModel
from typing import List


class Product(BaseModel):
    product_name: str
    description: str
    image_url: str
    product_link : str
    product_type: str
    product_brand: str