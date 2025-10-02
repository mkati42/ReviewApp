#!/usr/bin/env node

console.log('\n🚀 ReviewBoard Development Server Starting...\n');

console.log('═══════════════════════════════════════════════════════════');
console.log('                    🔑 TEST CREDENTIALS                     ');
console.log('═══════════════════════════════════════════════════════════');

console.log('\n👑 ADMIN ACCESS:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📧 Email:    admin@reviewboard.com');
console.log('🔑 Password: admin123');
console.log('🛡️  Role:     ADMIN');
console.log('🌐 Access:   All applications, admin panel, user management');

console.log('\n👤 DEMO USER ACCESS:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📧 Email:    user@reviewboard.com');
console.log('🔑 Password: user123');
console.log('🛡️  Role:     USER');
console.log('🌐 Access:   Own applications, dashboard');

console.log('\n🔗 OAUTH PROVIDERS:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🐙 GitHub OAuth (if configured in .env.local)');
console.log('🌐 Google OAuth (if configured in .env.local)');

console.log('\n📋 QUICK START:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. Visit: http://localhost:3000');
console.log('2. Click "Login" and use credentials above');
console.log('3. Admin: Access admin panel at /admin');
console.log('4. User: Create applications at /dashboard');

console.log('\n💡 TIP: Run `npm run seed` to create these test users');
console.log('═══════════════════════════════════════════════════════════\n');