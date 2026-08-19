// Customer name pools — Section 6.5 distribution: 60% Arabic, 30% South Asian, 10% Western.

const ARABIC_FIRST = [
  "Ahmed", "Mohammed", "Khalid", "Fahad", "Omar", "Saeed", "Abdullah", "Yousef",
  "Fatima", "Aisha", "Maryam", "Noura", "Sara", "Layla", "Hessa", "Reem",
];
const ARABIC_LAST = [
  "Al Rashid", "Al Maktoum", "bin Saeed", "Al Qahtani", "Al Suwaidi", "Al Nahyan",
  "Al Otaibi", "Al Zaabi", "Al Marri", "Al Hashimi",
];

const SOUTH_ASIAN_FIRST = [
  "Rajesh", "Priya", "Arjun", "Sneha", "Vikram", "Anjali", "Rahul", "Neha",
  "Imran", "Fatima", "Ayesha", "Bilal",
];
const SOUTH_ASIAN_LAST = [
  "Sharma", "Patel", "Nair", "Khan", "Ahmed", "Iqbal", "Reddy", "Gupta", "Malik", "Hussain",
];

const WESTERN_FIRST = ["James", "Sarah", "Michael", "Emma", "David", "Laura", "John", "Emily"];
const WESTERN_LAST = ["Wilson", "Mitchell", "Anderson", "Taylor", "Brown", "Clark"];

export function randomCustomerName(rand: () => number): string {
  const r = rand();
  if (r < 0.6) {
    return `${pick(ARABIC_FIRST, rand)} ${pick(ARABIC_LAST, rand)}`;
  }
  if (r < 0.9) {
    return `${pick(SOUTH_ASIAN_FIRST, rand)} ${pick(SOUTH_ASIAN_LAST, rand)}`;
  }
  return `${pick(WESTERN_FIRST, rand)} ${pick(WESTERN_LAST, rand)}`;
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

export function randomPhone(country: "UAE" | "KSA", rand: () => number): string {
  const cc = country === "UAE" ? "+971" : "+966";
  const num = Math.floor(rand() * 900000000 + 100000000);
  return `${cc} ${num}`;
}
