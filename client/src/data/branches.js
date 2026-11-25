const branches = [
  // =========================
  // DHAKA DIVISION
  // =========================

  {
    id: 1,
    name: "ZapShift Dhaka Branch",
    district: "Dhaka",
    division: "Dhaka",
    address: "Dhaka District Headquarters",
    phone: "01XXXXXXXXX",
    position: [23.8103, 90.4125],
  },

  {
    id: 2,
    name: "ZapShift Faridpur Branch",
    district: "Faridpur",
    division: "Dhaka",
    address: "Faridpur District Headquarters",
    phone: "01XXXXXXXXX",
    position: [23.6071, 89.8429],
  },

  {
    id: 3,
    name: "ZapShift Gazipur Branch",
    district: "Gazipur",
    division: "Dhaka",
    address: "Gazipur District Headquarters",
    phone: "01XXXXXXXXX",
    position: [24.0023, 90.4264],
  },

  {
    id: 4,
    name: "ZapShift Gopalganj Branch",
    district: "Gopalganj",
    division: "Dhaka",
    address: "Gopalganj District Headquarters",
    phone: "01XXXXXXXXX",
    position: [23.0051, 89.8266],
  },

  {
    id: 5,
    name: "ZapShift Kishoreganj Branch",
    district: "Kishoreganj",
    division: "Dhaka",
    address: "Kishoreganj District Headquarters",
    phone: "01XXXXXXXXX",
    position: [24.4449, 90.7766],
  },

  {
    id: 6,
    name: "ZapShift Madaripur Branch",
    district: "Madaripur",
    division: "Dhaka",
    address: "Madaripur District Headquarters",
    phone: "01XXXXXXXXX",
    position: [23.1641, 90.1897],
  },

  {
    id: 7,
    name: "ZapShift Manikganj Branch",
    district: "Manikganj",
    division: "Dhaka",
    address: "Manikganj District Headquarters",
    phone: "01XXXXXXXXX",
    position: [23.8617, 90.0003],
  },

  {
    id: 8,
    name: "ZapShift Munshiganj Branch",
    district: "Munshiganj",
    division: "Dhaka",
    address: "Munshiganj District Headquarters",
    phone: "01XXXXXXXXX",
    position: [23.5422, 90.5305],
  },

  {
    id: 9,
    name: "ZapShift Narayanganj Branch",
    district: "Narayanganj",
    division: "Dhaka",
    address: "Narayanganj District Headquarters",
    phone: "01XXXXXXXXX",
    position: [23.6238, 90.5000],
  },

  {
    id: 10,
    name: "ZapShift Narsingdi Branch",
    district: "Narsingdi",
    division: "Dhaka",
    address: "Narsingdi District Headquarters",
    phone: "01XXXXXXXXX",
    position: [23.9229, 90.7177],
  },

  {
    id: 11,
    name: "ZapShift Rajbari Branch",
    district: "Rajbari",
    division: "Dhaka",
    address: "Rajbari District Headquarters",
    phone: "01XXXXXXXXX",
    position: [23.7574, 89.6445],
  },

  {
    id: 12,
    name: "ZapShift Shariatpur Branch",
    district: "Shariatpur",
    division: "Dhaka",
    address: "Shariatpur District Headquarters",
    phone: "01XXXXXXXXX",
    position: [23.2423, 90.4348],
  },

  {
    id: 13,
    name: "ZapShift Tangail Branch",
    district: "Tangail",
    division: "Dhaka",
    address: "Tangail District Headquarters",
    phone: "01XXXXXXXXX",
    position: [24.2513, 89.9167],
  },


  // =========================
  // KHULNA DIVISION
  // =========================

  {
    id: 14,
    name: "ZapShift Bagerhat Branch",
    district: "Bagerhat",
    division: "Khulna",
    address: "Bagerhat District Headquarters",
    phone: "01XXXXXXXXX",
    position: [22.6516, 89.7859],
  },

  {
    id: 15,
    name: "ZapShift Chuadanga Branch",
    district: "Chuadanga",
    division: "Khulna",
    address: "Chuadanga District Headquarters",
    phone: "01XXXXXXXXX",
    position: [23.6402, 88.8418],
  },

  {
    id: 16,
    name: "ZapShift Jashore Branch",
    district: "Jashore",
    division: "Khulna",
    address: "Jashore District Headquarters",
    phone: "01XXXXXXXXX",
    position: [23.1664, 89.2089],
  },

  {
    id: 17,
    name: "ZapShift Jhenaidah Branch",
    district: "Jhenaidah",
    division: "Khulna",
    address: "Jhenaidah District Headquarters",
    phone: "01XXXXXXXXX",
    position: [23.5448, 89.1539],
  },

  {
    id: 18,
    name: "ZapShift Khulna Branch",
    district: "Khulna",
    division: "Khulna",
    address: "Khulna District Headquarters",
    phone: "01XXXXXXXXX",
    position: [22.8456, 89.5403],
  },

  {
    id: 19,
    name: "ZapShift Kushtia Branch",
    district: "Kushtia",
    division: "Khulna",
    address: "Kushtia District Headquarters",
    phone: "01XXXXXXXXX",
    position: [23.9013, 89.1205],
  },

  {
    id: 20,
    name: "ZapShift Magura Branch",
    district: "Magura",
    division: "Khulna",
    address: "Magura District Headquarters",
    phone: "01XXXXXXXXX",
    position: [23.4873, 89.4191],
  },

  {
    id: 21,
    name: "ZapShift Meherpur Branch",
    district: "Meherpur",
    division: "Khulna",
    address: "Meherpur District Headquarters",
    phone: "01XXXXXXXXX",
    position: [23.7622, 88.6318],
  },

  {
    id: 22,
    name: "ZapShift Narail Branch",
    district: "Narail",
    division: "Khulna",
    address: "Narail District Headquarters",
    phone: "01XXXXXXXXX",
    position: [23.1725, 89.5127],
  },

  {
    id: 23,
    name: "ZapShift Satkhira Branch",
    district: "Satkhira",
    division: "Khulna",
    address: "Satkhira District Headquarters",
    phone: "01XXXXXXXXX",
    position: [22.7185, 89.0705],
  },


  // =========================
  // CHATTOGRAM DIVISION
  // =========================

  {
    id: 24,
    name: "ZapShift Bandarban Branch",
    district: "Bandarban",
    division: "Chattogram",
    address: "Bandarban District Headquarters",
    phone: "01XXXXXXXXX",
    position: [22.1953, 92.2184],
  },

  {
    id: 25,
    name: "ZapShift Brahmanbaria Branch",
    district: "Brahmanbaria",
    division: "Chattogram",
    address: "Brahmanbaria District Headquarters",
    phone: "01XXXXXXXXX",
    position: [23.9571, 91.1119],
  },

  {
    id: 26,
    name: "ZapShift Chandpur Branch",
    district: "Chandpur",
    division: "Chattogram",
    address: "Chandpur District Headquarters",
    phone: "01XXXXXXXXX",
    position: [23.2331, 90.6631],
  },

  {
    id: 27,
    name: "ZapShift Chattogram Branch",
    district: "Chattogram",
    division: "Chattogram",
    address: "Chattogram District Headquarters",
    phone: "01XXXXXXXXX",
    position: [22.3569, 91.7832],
  },

  {
    id: 28,
    name: "ZapShift Cumilla Branch",
    district: "Cumilla",
    division: "Chattogram",
    address: "Cumilla District Headquarters",
    phone: "01XXXXXXXXX",
    position: [23.4607, 91.1809],
  },

  {
    id: 29,
    name: "ZapShift Cox's Bazar Branch",
    district: "Cox's Bazar",
    division: "Chattogram",
    address: "Cox's Bazar District Headquarters",
    phone: "01XXXXXXXXX",
    position: [21.4272, 92.0058],
  },

  {
    id: 30,
    name: "ZapShift Feni Branch",
    district: "Feni",
    division: "Chattogram",
    address: "Feni District Headquarters",
    phone: "01XXXXXXXXX",
    position: [23.0159, 91.3976],
  },

  {
    id: 31,
    name: "ZapShift Khagrachhari Branch",
    district: "Khagrachhari",
    division: "Chattogram",
    address: "Khagrachhari District Headquarters",
    phone: "01XXXXXXXXX",
    position: [23.1193, 91.9847],
  },

  {
    id: 32,
    name: "ZapShift Lakshmipur Branch",
    district: "Lakshmipur",
    division: "Chattogram",
    address: "Lakshmipur District Headquarters",
    phone: "01XXXXXXXXX",
    position: [22.9447, 90.8412],
  },

  {
    id: 33,
    name: "ZapShift Noakhali Branch",
    district: "Noakhali",
    division: "Chattogram",
    address: "Noakhali District Headquarters",
    phone: "01XXXXXXXXX",
    position: [22.8696, 91.0994],
  },

  {
    id: 34,
    name: "ZapShift Rangamati Branch",
    district: "Rangamati",
    division: "Chattogram",
    address: "Rangamati District Headquarters",
    phone: "01XXXXXXXXX",
    position: [22.7324, 92.2985],
  },


  // =========================
  // RAJSHAHI DIVISION
  // =========================

  {
    id: 35,
    name: "ZapShift Bogura Branch",
    district: "Bogura",
    division: "Rajshahi",
    address: "Bogura District Headquarters",
    phone: "01XXXXXXXXX",
    position: [24.8465, 89.3772],
  },

  {
    id: 36,
    name: "ZapShift Joypurhat Branch",
    district: "Joypurhat",
    division: "Rajshahi",
    address: "Joypurhat District Headquarters",
    phone: "01XXXXXXXXX",
    position: [25.0968, 89.0227],
  },

  {
    id: 37,
    name: "ZapShift Naogaon Branch",
    district: "Naogaon",
    division: "Rajshahi",
    address: "Naogaon District Headquarters",
    phone: "01XXXXXXXXX",
    position: [24.7936, 88.9318],
  },

  {
    id: 38,
    name: "ZapShift Natore Branch",
    district: "Natore",
    division: "Rajshahi",
    address: "Natore District Headquarters",
    phone: "01XXXXXXXXX",
    position: [24.4206, 89.0000],
  },

  {
    id: 39,
    name: "ZapShift Chapainawabganj Branch",
    district: "Chapainawabganj",
    division: "Rajshahi",
    address: "Chapainawabganj District Headquarters",
    phone: "01XXXXXXXXX",
    position: [24.5965, 88.2775],
  },

  {
    id: 40,
    name: "ZapShift Pabna Branch",
    district: "Pabna",
    division: "Rajshahi",
    address: "Pabna District Headquarters",
    phone: "01XXXXXXXXX",
    position: [24.0064, 89.2372],
  },

  {
    id: 41,
    name: "ZapShift Rajshahi Branch",
    district: "Rajshahi",
    division: "Rajshahi",
    address: "Rajshahi District Headquarters",
    phone: "01XXXXXXXXX",
    position: [24.3745, 88.6042],
  },

  {
    id: 42,
    name: "ZapShift Sirajganj Branch",
    district: "Sirajganj",
    division: "Rajshahi",
    address: "Sirajganj District Headquarters",
    phone: "01XXXXXXXXX",
    position: [24.4534, 89.7007],
  },


  // =========================
  // SYLHET DIVISION
  // =========================

  {
    id: 43,
    name: "ZapShift Habiganj Branch",
    district: "Habiganj",
    division: "Sylhet",
    address: "Habiganj District Headquarters",
    phone: "01XXXXXXXXX",
    position: [24.3745, 91.4156],
  },

  {
    id: 44,
    name: "ZapShift Moulvibazar Branch",
    district: "Moulvibazar",
    division: "Sylhet",
    address: "Moulvibazar District Headquarters",
    phone: "01XXXXXXXXX",
    position: [24.4829, 91.7774],
  },

  {
    id: 45,
    name: "ZapShift Sunamganj Branch",
    district: "Sunamganj",
    division: "Sylhet",
    address: "Sunamganj District Headquarters",
    phone: "01XXXXXXXXX",
    position: [25.0658, 91.3950],
  },

  {
    id: 46,
    name: "ZapShift Sylhet Branch",
    district: "Sylhet",
    division: "Sylhet",
    address: "Sylhet District Headquarters",
    phone: "01XXXXXXXXX",
    position: [24.8949, 91.8687],
  },


  // =========================
  // RANGPUR DIVISION
  // =========================

  {
    id: 47,
    name: "ZapShift Dinajpur Branch",
    district: "Dinajpur",
    division: "Rangpur",
    address: "Dinajpur District Headquarters",
    phone: "01XXXXXXXXX",
    position: [25.6279, 88.6332],
  },

  {
    id: 48,
    name: "ZapShift Gaibandha Branch",
    district: "Gaibandha",
    division: "Rangpur",
    address: "Gaibandha District Headquarters",
    phone: "01XXXXXXXXX",
    position: [25.3288, 89.5280],
  },

  {
    id: 49,
    name: "ZapShift Kurigram Branch",
    district: "Kurigram",
    division: "Rangpur",
    address: "Kurigram District Headquarters",
    phone: "01XXXXXXXXX",
    position: [25.8054, 89.6362],
  },

  {
    id: 50,
    name: "ZapShift Lalmonirhat Branch",
    district: "Lalmonirhat",
    division: "Rangpur",
    address: "Lalmonirhat District Headquarters",
    phone: "01XXXXXXXXX",
    position: [25.9165, 89.4532],
  },

  {
    id: 51,
    name: "ZapShift Nilphamari Branch",
    district: "Nilphamari",
    division: "Rangpur",
    address: "Nilphamari District Headquarters",
    phone: "01XXXXXXXXX",
    position: [25.9318, 88.8560],
  },

  {
    id: 52,
    name: "ZapShift Panchagarh Branch",
    district: "Panchagarh",
    division: "Rangpur",
    address: "Panchagarh District Headquarters",
    phone: "01XXXXXXXXX",
    position: [26.3334, 88.5578],
  },

  {
    id: 53,
    name: "ZapShift Rangpur Branch",
    district: "Rangpur",
    division: "Rangpur",
    address: "Rangpur District Headquarters",
    phone: "01XXXXXXXXX",
    position: [25.7439, 89.2752],
  },

  {
    id: 54,
    name: "ZapShift Thakurgaon Branch",
    district: "Thakurgaon",
    division: "Rangpur",
    address: "Thakurgaon District Headquarters",
    phone: "01XXXXXXXXX",
    position: [26.0337, 88.4617],
  },


  // =========================
  // MYMENSINGH DIVISION
  // =========================

  {
    id: 55,
    name: "ZapShift Jamalpur Branch",
    district: "Jamalpur",
    division: "Mymensingh",
    address: "Jamalpur District Headquarters",
    phone: "01XXXXXXXXX",
    position: [24.9375, 90.4203],
  },

  {
    id: 56,
    name: "ZapShift Mymensingh Branch",
    district: "Mymensingh",
    division: "Mymensingh",
    address: "Mymensingh District Headquarters",
    phone: "01XXXXXXXXX",
    position: [24.7471, 90.4203],
  },

  {
    id: 57,
    name: "ZapShift Netrokona Branch",
    district: "Netrokona",
    division: "Mymensingh",
    address: "Netrokona District Headquarters",
    phone: "01XXXXXXXXX",
    position: [24.8700, 90.7278],
  },

  {
    id: 58,
    name: "ZapShift Sherpur Branch",
    district: "Sherpur",
    division: "Mymensingh",
    address: "Sherpur District Headquarters",
    phone: "01XXXXXXXXX",
    position: [25.0205, 90.0153],
  },


  // =========================
  // BARISHAL DIVISION
  // =========================

  {
    id: 59,
    name: "ZapShift Barguna Branch",
    district: "Barguna",
    division: "Barishal",
    address: "Barguna District Headquarters",
    phone: "01XXXXXXXXX",
    position: [22.0953, 90.1121],
  },

  {
    id: 60,
    name: "ZapShift Barishal Branch",
    district: "Barishal",
    division: "Barishal",
    address: "Barishal District Headquarters",
    phone: "01XXXXXXXXX",
    position: [22.7010, 90.3535],
  },

  {
    id: 61,
    name: "ZapShift Bhola Branch",
    district: "Bhola",
    division: "Barishal",
    address: "Bhola District Headquarters",
    phone: "01XXXXXXXXX",
    position: [22.6859, 90.6482],
  },

  {
    id: 62,
    name: "ZapShift Jhalokathi Branch",
    district: "Jhalokathi",
    division: "Barishal",
    address: "Jhalokathi District Headquarters",
    phone: "01XXXXXXXXX",
    position: [22.6406, 90.1987],
  },

  {
    id: 63,
    name: "ZapShift Patuakhali Branch",
    district: "Patuakhali",
    division: "Barishal",
    address: "Patuakhali District Headquarters",
    phone: "01XXXXXXXXX",
    position: [22.3596, 90.3299],
  },

  {
    id: 64,
    name: "ZapShift Pirojpur Branch",
    district: "Pirojpur",
    division: "Barishal",
    address: "Pirojpur District Headquarters",
    phone: "01XXXXXXXXX",
    position: [22.5841, 89.9720],
  },
];

export default branches;