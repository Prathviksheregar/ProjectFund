#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth.models import User
from APIs.models import UserProfile

# User details
wallet_address = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
username = wallet_address.lower()

try:
    # Create or get user
    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            'email': f'{username}@projectfund.local',
            'is_active': True
        }
    )
    
    # Create or update profile
    profile, profile_created = UserProfile.objects.get_or_create(
        user=user,
        defaults={
            'wallet_address': wallet_address,
            'is_verified': True,
            'is_admin': False,
            'reputation_score': 0
        }
    )
    
    if not profile_created:
        profile.wallet_address = wallet_address
        profile.is_verified = True
        profile.save()
    
    print(f"✓ User registered successfully!")
    print(f"  Username: {user.username}")
    print(f"  Wallet: {wallet_address}")
    print(f"  Verified: {profile.is_verified}")
    print(f"  User created: {created}")
    print(f"  Profile created: {profile_created}")
    
except Exception as e:
    print(f"✗ Error registering user: {e}")
    sys.exit(1)
