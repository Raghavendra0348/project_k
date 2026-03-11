#!/bin/bash

# Add all environment variables to Vercel
vercel env add REACT_APP_FIREBASE_API_KEY production --value "AIzaSyDuE7R5NI01rQdYY5BrPKfoMqK9bcRYo84" --yes
vercel env add REACT_APP_FIREBASE_AUTH_DOMAIN production --value "vending-machine-web.firebaseapp.com" --yes
vercel env add REACT_APP_FIREBASE_PROJECT_ID production --value "vending-machine-web" --yes
vercel env add REACT_APP_FIREBASE_STORAGE_BUCKET production --value "vending-machine-web.firebasestorage.app" --yes
vercel env add REACT_APP_FIREBASE_MESSAGING_SENDER_ID production --value "188303260362" --yes
vercel env add REACT_APP_FIREBASE_APP_ID production --value "1:188303260362:web:bbecd754740724c0cdd233" --yes
vercel env add REACT_APP_RAZORPAY_KEY_ID production --value "rzp_test_SFcjAAIXATSVHV" --yes
vercel env add REACT_APP_ENV production --value "production" --yes
vercel env add FIREBASE_PROJECT_ID production --value "vending-machine-web" --yes
vercel env add FIREBASE_CLIENT_EMAIL production --value "firebase-adminsdk-fbsvc@vending-machine-web.iam.gserviceaccount.com" --yes
vercel env add FIREBASE_PRIVATE_KEY production --value "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDfhHz5vn1dmklf\nra3DxSH3hCkC3cVk90j4UcniA24m+sIN4lV/Wa16DEgysxcKI69wS5vv1ezm5DbB\nsX8B/w1NwWI7jkZ9VNlI0hX9DEcI1iN7BZta1ev2pYG60paBvwhRcVnsy0I8AELh\nt8gDA1K98quISo3iJQojt+0jXAU7SeST3++IbjDwRwihjBM65kviF42CX1sJA0sU\nTkytOTfwf01AhMlOQ6IlT2tJMJZGHRgTGXHyQh2WmmJkNe+SSd2g06/wMQC1bReK\npOW4fK88t4ISJ0s71J/gu6jGC28Vo8qZpwa3c6OlemchAyYWncrp9fzLjlXyvcWd\nTG8ACL6lAgMBAAECggEAFY4BP1RPYqduS/vDtg1cqTHlgpFAZ+ww7UF15oXOKZQl\nApHBDPbo88wbakg7AI9Qa9PexdIrdlirryIezWJ7NfRgNL4TriJwkcUwuaZlc0Sz\nRznTMX9Psglj6VBFk12Iv9HeiidPy9l6manPb/ryD79HK22FITnRMICcLbzCBGV9\nr1IGUgEhz4w3r5jdmtQ81b8xAaMMAivkhBvlADbA+ZyUQ1Eq9h2Y5f0rHQTelQ+A\nkE5ZTCRiH9HHyKP7Ry34XGOs6xoZBzp0SfeWvlN8S5oWfygvQqHf5cFRKHE2cwLw\nzEHEbnwPplziir0bpGdJWdZZYJ7UIF6cO/vXkjleQQKBgQD07nrG8WgTw85GUjQn\nVwkPSk5pgZ0/pGkd9yeXCgbdaLfakzchfc/EqIy6wuHp8oAQDuoWqHvJm8Ek4Pbn\n3L0i7w7L5Ox85D74yxOzU8GRetPHeP0XueD4V7j5F+YfJ7TkgkjXe9rHFvP548iA\nPCr8n1liWGOvcNVacGnZyeg3pwKBgQDpnkceDp7pTE78zv8+soisT1v8b2tbV/fh\nSTSZR1aZYaPjc2cATyI+jqlec4NY96keDz8rjUVtFekihLbFJpfD/w2/zMQGCCCx\nCkQLRI9DYlww04wg7DHFCe72k3pCJfAKat57DOnzJGB55HQSBmaVNohhyGIx4bdM\n7v0C0aIg0wKBgQCEE4VJeivxXIkDCpjtDdXo1Nzrr+UnyHSWoAxNOi7xfeKGjxQP\nj1RWa71XiHdiPE4qWqCIj1oRIVhJlrYN2c5z5A1KjauovTvn1TpOXT/oPx+sVOXF\nwYo64LLyP5zr9/Fnt4moCTW0XgA6JEaeP9O+Xf9JNPisRmAGYM/zjRkXyQJ/Q4d9\nBzMyvD1Sl8E+BuGUoDpQXKfYYI8NGBIRIj18ytluhlDVdUFqpKqYSrUZQp5URFwj\n5nLvnpi2y0ORkWuWcxFG6CpIf3XZ/VL6WEd5IgFMpNCBsQKVYF9+s8ftjzFoMZqy\ntN8GwUHCoXloE83F2VvqEFncCI82bQaoHCh8tQKBgQDL+k0Ggm56X+5tKxiyGMPn\n1ezDl4W9z2wFItCIodPQD+e30Qr9jgqh/YH+US6LnsRQzLizxB6y/7JUFzS8gGck\nT41OhevDO/VuySCkJQShDBbkjWmEBUvQ3FApOqNzVZUGfDKuANe5ragALzjhX8Hx\n1KHt2hzEtZFcYVlueVuabw==\n-----END PRIVATE KEY-----\n" --yes
vercel env add RAZORPAY_KEY_ID production --value "rzp_test_SFcjAAIXATSVHV" --yes
vercel env add RAZORPAY_KEY_SECRET production --value "eiHqWLloxF0CFS2iluJ78nPE" --yes
vercel env add NODE_ENV production --value "production" --yes

echo "✅ All environment variables added to Vercel!"
