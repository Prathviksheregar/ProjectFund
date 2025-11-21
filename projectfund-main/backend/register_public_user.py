from APIs.models import Voter
from django.db import models

# Create or update the public user record
address = "0x8ffb13e194414c545870f8bd2feeedd1d47f5fec"

# Try to get or create the voter
voter, created = Voter.objects.get_or_create(
    address=address,
    defaults={
        'is_registered': True,
        'is_authority': False,
    }
)

if created:
    print(f"✅ Created new public voter: {address}")
else:
    # Update if exists
    voter.is_registered = True
    voter.is_authority = False
    voter.save()
    print(f"✅ Updated public voter: {address}")

print(f"Voter details:")
print(f"  Address: {voter.address}")
print(f"  Is Registered: {voter.is_registered}")
print(f"  Is Authority: {voter.is_authority}")
