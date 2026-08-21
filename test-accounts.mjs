// Barcha 6 ta hisobni backendga ulanib tekshiradigan skript.
// Ishlatish: shu papkada terminalda: node test-accounts.mjs
//
// Bu skript har bir hisob bilan /auth/login qiladi va backend qaytargan
// "role" maydoni ANIQ nima ekanini ko'rsatadi. Agar u "waiter" o'rniga
// masalan "Waiter" yoki boshqa narsa qaytarsa — /waiter sahifasi
// "Sahifa topilmadi" bo'lib chiqishining sababi shu bo'ladi.

const BASE = 'https://ziyofat-backend-production-5557.up.railway.app/api';

const accounts = [
  { role: 'super-admin', email: 'admin+1787252574941@rayhon.uz', password: 'Setup123!' },
  { role: 'cashier', email: 'kassir+1787252581766@rayhon.uz', password: 'Setup123!' },
  { role: 'ceo', email: 'ceo+1787252582943@rayhon.uz', password: 'Setup123!' },
  { role: 'admin', email: 'admin.panel+1787252583454@rayhon.uz', password: 'Setup123!' },
  { role: 'waiter', email: 'ofitsiant+1787252583822@rayhon.uz', password: 'Setup123!' },
  { role: 'kitchen', email: 'oshpaz+1787252584382@rayhon.uz', password: 'Setup123!' },
];

const EXPECTED_ROLES = ['super-admin', 'admin', 'kitchen', 'waiter', 'cashier', 'ceo', 'customer'];

function extractToken(payload) {
  return payload.token || payload.accessToken || payload.jwt || payload.access_token || null;
}

function extractUserRaw(payload) {
  return payload.user || payload.currentUser || (payload.role ? payload : null);
}

async function testAccount(acc) {
  console.log(`\n=== ${acc.role.toUpperCase()} (${acc.email}) ===`);
  try {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: acc.email, password: acc.password }),
    });
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      console.log(`❌ HTTP ${res.status} — JSON emas javob:`, text.slice(0, 300));
      return;
    }
    if (!res.ok) {
      console.log(`❌ HTTP ${res.status}:`, JSON.stringify(json));
      return;
    }

    const payload = json && typeof json === 'object' && 'data' in json ? json.data : json;
    const token = extractToken(payload);
    const rawUser = extractUserRaw(payload);

    console.log('Token bormi:', token ? '✓ ha' : '✗ YO\'Q — muammo shu yerda!');
    console.log('Backend qaytargan xom user obyekti:', JSON.stringify(rawUser));

    if (!rawUser) {
      console.log('❌ Foydalanuvchi obyekti topilmadi — javob formati kutilganidan farq qiladi.');
      return;
    }

    const role = rawUser.role;
    console.log(`Role maydoni: "${role}" (tip: ${typeof role})`);

    if (!role) {
      console.log('❌ MUAMMO: "role" maydoni umuman yo\'q yoki bo\'sh!');
    } else if (!EXPECTED_ROLES.includes(role)) {
      console.log(
        `❌ MUAMMO: backend "${role}" qaytardi, lekin frontend faqat quyidagilarni taniydi: ${EXPECTED_ROLES.join(', ')}`
      );
      console.log('   (masalan katta-kichik harf farqi yoki boshqa nom bo\'lishi mumkin)');
    } else if (role !== acc.role) {
      console.log(`⚠️  Kutilgan rol "${acc.role}" edi, lekin backend "${role}" qaytardi.`);
    } else {
      console.log('✓ Rol to\'g\'ri va frontend buni tanийdi.');
    }

    // /auth/me ham tekshiramiz (sahifa yangilanganda shu ishlatiladi)
    if (token) {
      const meRes = await fetch(`${BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const meText = await meRes.text();
      let meJson;
      try {
        meJson = JSON.parse(meText);
      } catch {
        meJson = null;
      }
      console.log(`/auth/me → HTTP ${meRes.status}:`, JSON.stringify(meJson));
    }
  } catch (err) {
    console.log('❌ So\'rov xatosi:', err.message);
  }
}

for (const acc of accounts) {
  await testAccount(acc);
}

console.log('\n\n=== TEKSHIRUV TUGADI ===');
console.log('Yuqorida "❌ MUAMMO" deb belgilangan qatorlar bor bo\'lsa, aynan o\'sha rolda xato bor.');
