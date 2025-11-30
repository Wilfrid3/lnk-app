/**
 * Shared offering options used across the application
 * Used in places like PreferencesStep, PostCard, etc.
 */
export const offeringOptions = [
  { id: "sexcam", label: "Sexcam", icon: "videocam" },
  { id: "plan_a_3", label: "Plan à 3", icon: "group" },
  { id: "massages", label: "Massages", icon: "spa" },
  { id: "annulingus", label: "Annulingus", icon: "favorite" },
  { id: "fumeur", label: "Fumeur(se)", icon: "smoking_rooms" },
  { id: "gode", label: "Gode", icon: "fitness_center" },
  { id: "enceinte", label: "Enceinte", icon: "pregnant_woman" },
  { id: "fontaine", label: "Fontaine", icon: "water_drop" },
  { id: "sans_preso", label: "Sans préso", icon: "block" },
  { id: "anal", label: "Anal", icon: "circle" },
  { id: "strip_tease", label: "Strip-tease", icon: "whatshot" },
  { id: "sexe_dehors", label: "Sexe dehors", icon: "park" },
  { id: "orgie", label: "Orgie", icon: "group" },
  { id: 'tatouages', label: 'Tatouages', icon: 'brush' },
  { id: 'percings', label: 'Percings', icon: 'auto_awesome' },
];

/**
 * Comprehensive list of adult services in French
 * Used for package builder in preferences and public profile
 */
export const adultServices = [
  // Services intimes de base
  { id: "service_traditionnel", label: "Service traditionnel", category: "base", icon: "favorite" },
  { id: "service_classique", label: "Service classique", category: "base", icon: "favorite" },
  { id: "caresses", label: "Caresses", category: "base", icon: "touch_app" },
  { id: "baisers", label: "Baisers", category: "base", icon: "kiss" },
  { id: "preliminaires", label: "Préliminaires", category: "base", icon: "favorite_border" },

  // Services oraux
  { id: "fellation", label: "Fellation", category: "oral", icon: "circle" },
  { id: "fellation_avec_deglutition", label: "Fellation avec déglutition", category: "oral", icon: "circle" },
  { id: "fellation_sans_preservatif", label: "Fellation sans préservatif", category: "oral", icon: "circle" },
  { id: "cunnilingus", label: "Cunnilingus", category: "oral", icon: "favorite" },
  { id: "annulingus", label: "Annulingus", category: "oral", icon: "favorite" },
  { id: "69", label: "69", category: "oral", icon: "favorite" },

  // Services anaux
  { id: "sodomie", label: "Sodomie", category: "anal", icon: "circle" },
  { id: "penetration_anale", label: "Pénétration anale", category: "anal", icon: "circle" },
  { id: "jeux_anaux", label: "Jeux anaux", category: "anal", icon: "circle" },

  // Massages
  { id: "massage_erotique", label: "Massage érotique", category: "massage", icon: "spa" },
  { id: "massage_tantrique", label: "Massage tantrique", category: "massage", icon: "spa" },
  { id: "massage_naturiste", label: "Massage naturiste", category: "massage", icon: "spa" },
  { id: "massage_lingam", label: "Massage lingam", category: "massage", icon: "spa" },
  { id: "massage_yoni", label: "Massage yoni", category: "massage", icon: "spa" },
  { id: "massage_prostatique", label: "Massage prostatique", category: "massage", icon: "spa" },
  { id: "massage_corps_a_corps", label: "Massage corps à corps", category: "massage", icon: "spa" },

  // Positions et pratiques
  { id: "toutes_positions", label: "Toutes positions", category: "positions", icon: "fitness_center" },
  { id: "amazone", label: "Amazone", category: "positions", icon: "fitness_center" },
  { id: "levrette", label: "Levrette", category: "positions", icon: "fitness_center" },
  { id: "missionnaire", label: "Missionnaire", category: "positions", icon: "fitness_center" },
  { id: "cuillere", label: "Cuillère", category: "positions", icon: "fitness_center" },
  { id: "andromaque", label: "Andromaque", category: "positions", icon: "fitness_center" },

  // Services multiples
  { id: "plan_a_trois", label: "Plan à trois", category: "multiple", icon: "group" },
  { id: "partouze", label: "Partouze", category: "multiple", icon: "group" },
  { id: "gang_bang", label: "Gang bang", category: "multiple", icon: "group" },
  { id: "orgie", label: "Orgie", category: "multiple", icon: "group" },
  { id: "echangisme", label: "Échangisme", category: "multiple", icon: "group" },
  { id: "melangisme", label: "Mélangisme", category: "multiple", icon: "group" },

  // Jeux et accessoires
  { id: "gode", label: "Utilisation de gode", category: "accessoires", icon: "fitness_center" },
  { id: "sextoys", label: "Sex-toys", category: "accessoires", icon: "fitness_center" },
  { id: "vibromasseurs", label: "Vibromasseurs", category: "accessoires", icon: "fitness_center" },
  { id: "plug_anal", label: "Plug anal", category: "accessoires", icon: "fitness_center" },
  { id: "menottes", label: "Menottes", category: "accessoires", icon: "lock" },
  { id: "fouet", label: "Fouet", category: "accessoires", icon: "sports_martial_arts" },

  // BDSM et domination
  { id: "domination", label: "Domination", category: "bdsm", icon: "sports_martial_arts" },
  { id: "soumission", label: "Soumission", category: "bdsm", icon: "sports_martial_arts" },
  { id: "bondage", label: "Bondage", category: "bdsm", icon: "lock" },
  { id: "spanking", label: "Spanking", category: "bdsm", icon: "sports_martial_arts" },
  { id: "cire_chaude", label: "Cire chaude", category: "bdsm", icon: "local_fire_department" },
  { id: "jeux_de_role", label: "Jeux de rôle", category: "bdsm", icon: "theater_comedy" },

  // Spécialités
  { id: "strip_tease", label: "Strip-tease", category: "specialites", icon: "whatshot" },
  { id: "lap_dance", label: "Lap dance", category: "specialites", icon: "music_note" },
  { id: "show_prive", label: "Show privé", category: "specialites", icon: "visibility" },
  { id: "danse_sensuelle", label: "Danse sensuelle", category: "specialites", icon: "music_note" },
  { id: "jeux_de_seduction", label: "Jeux de séduction", category: "specialites", icon: "favorite" },

  // Services virtuels
  { id: "sexcam", label: "Sexcam", category: "virtuel", icon: "videocam" },
  { id: "video_call", label: "Appel vidéo", category: "virtuel", icon: "video_call" },
  { id: "chat_erotique", label: "Chat érotique", category: "virtuel", icon: "chat" },
  { id: "photos_personnalisees", label: "Photos personnalisées", category: "virtuel", icon: "photo_camera" },
  { id: "videos_personnalisees", label: "Vidéos personnalisées", category: "virtuel", icon: "videocam" },

  // Services particuliers
  { id: "fetichisme_pieds", label: "Fétichisme des pieds", category: "fetichisme", icon: "directions_walk" },
  { id: "fetichisme_lingerie", label: "Fétichisme lingerie", category: "fetichisme", icon: "checkroom" },
  { id: "urophilie", label: "Urophilie", category: "fetichisme", icon: "water_drop" },
  { id: "exhibitionnisme", label: "Exhibitionnisme", category: "fetichisme", icon: "visibility" },
  { id: "voyeurisme", label: "Voyeurisme", category: "fetichisme", icon: "remove_red_eye" },

  // Services extérieurs
  { id: "sexe_dehors", label: "Sexe en extérieur", category: "exterieur", icon: "park" },
  { id: "voiture", label: "Dans la voiture", category: "exterieur", icon: "directions_car" },
  { id: "plage", label: "À la plage", category: "exterieur", icon: "beach_access" },
  { id: "foret", label: "En forêt", category: "exterieur", icon: "park" },

  // Accompagnement
  { id: "gfe", label: "Girlfriend Experience", category: "accompagnement", icon: "favorite" },
  { id: "diner_aux_chandelles", label: "Dîner aux chandelles", category: "accompagnement", icon: "restaurant" },
  { id: "soiree_accompagnement", label: "Soirée d'accompagnement", category: "accompagnement", icon: "event" },
  { id: "week_end_complet", label: "Week-end complet", category: "accompagnement", icon: "weekend" },
  { id: "voyage_accompagnement", label: "Voyage d'accompagnement", category: "accompagnement", icon: "flight" },

  // Services de luxe
  { id: "service_vip", label: "Service VIP", category: "luxe", icon: "star" },
  { id: "champagne_service", label: "Service champagne", category: "luxe", icon: "wine_bar" },
  { id: "jacuzzi", label: "Jacuzzi", category: "luxe", icon: "hot_tub" },
  { id: "suite_luxe", label: "Suite de luxe", category: "luxe", icon: "hotel" },
];

/**
 * Service categories for organizing services
 */
export const serviceCategories = [
  { id: "base", label: "Services de base", icon: "favorite", color: "#f59e0b" },
  { id: "oral", label: "Services oraux", icon: "circle", color: "#ef4444" },
  { id: "anal", label: "Services anaux", icon: "circle", color: "#8b5cf6" },
  { id: "massage", label: "Massages", icon: "spa", color: "#06b6d4" },
  { id: "positions", label: "Positions", icon: "fitness_center", color: "#10b981" },
  { id: "multiple", label: "Services multiples", icon: "group", color: "#f97316" },
  { id: "accessoires", label: "Accessoires & Jeux", icon: "fitness_center", color: "#ec4899" },
  { id: "bdsm", label: "BDSM & Domination", icon: "sports_martial_arts", color: "#7c3aed" },
  { id: "specialites", label: "Spécialités", icon: "whatshot", color: "#dc2626" },
  { id: "virtuel", label: "Services virtuels", icon: "videocam", color: "#2563eb" },
  { id: "fetichisme", label: "Fétichisme", icon: "visibility", color: "#9333ea" },
  { id: "exterieur", label: "Extérieur", icon: "park", color: "#059669" },
  { id: "accompagnement", label: "Accompagnement", icon: "event", color: "#0891b2" },
  { id: "luxe", label: "Services de luxe", icon: "star", color: "#ca8a04" },
];

/**
 * Client types available in the application
 */
export const clientTypes = ["Hommes", "Femmes", "Couples", "Tous"];

/**
 * Appearance options available in the application
 * These are the base values stored in the database (neutral forms)
 */
export const appearances = ["Noir", "Brun", "Métis", "Blanc", "Ébène"];

/**
 * Gender-specific appearance labels for display in forms
 * Maps base values to gender-appropriate display labels
 */
export const appearanceLabels = {
  homme: {
    "Noir": "Noir",
    "Brun": "Brun",
    "Métis": "Métis",
    "Blanc": "Blanc",
    "Ébène": "Ébène"
  },
  femme: {
    "Noir": "Noire",
    "Brun": "Brune",
    "Métis": "Métisse",
    "Blanc": "Blanche",
    "Ébène": "Ébène"
  },
  couple: {
    "Noir": "Noir/Noire",
    "Brun": "Brun/Brune",
    "Métis": "Métis/Métisse",
    "Blanc": "Blanc/Blanche",
    "Ébène": "Ébène"
  },
  autres: {
    "Noir": "Noir",
    "Brun": "Brun",
    "Métis": "Métis",
    "Blanc": "Blanc",
    "Ébène": "Ébène"
  }
};

/**
 * Appearance options for search filters with colors
 * Uses base values for consistent filtering regardless of user gender
 */
export const appearanceFilters = [
  { id: 'Noir', label: 'Noir(e)', color: '#3d0c02' },
  { id: 'Brun', label: 'Brun(e)', color: '#6f4e37' },
  { id: 'Métis', label: 'Métis(se)', color: '#d8a373' },
  { id: 'Blanc', label: 'Blanc(he)', color: '#ffe0bd' },
  { id: 'Ébène', label: 'Ébène', color: '#1a0a05' }
];

/**
 * Helper function to get display label for appearance based on user gender
 */
export const getAppearanceDisplayLabel = (appearance: string, userType?: string): string => {
  if (!userType || !appearanceLabels[userType as keyof typeof appearanceLabels]) {
    return appearance;
  }

  const labels = appearanceLabels[userType as keyof typeof appearanceLabels];
  return labels[appearance as keyof typeof labels] || appearance;
};

/**
 * Countries with their phone codes and country codes
 * Used across the application for location-based features
 */
export const countries = [
  { code: '+237', countryCode: 'cm', name: 'Cameroun' },
  { code: '+33', countryCode: 'fr', name: 'France' },
  { code: '+225', countryCode: 'ci', name: 'Côte d\'Ivoire' },
  { code: '+221', countryCode: 'sn', name: 'Sénégal' },
  { code: '+226', countryCode: 'bf', name: 'Burkina Faso' },
  { code: '+241', countryCode: 'ga', name: 'Gabon' },
  { code: '+242', countryCode: 'cg', name: 'Congo' },
  { code: '+243', countryCode: 'cd', name: 'République démocratique du Congo' }
];

/**
 * Cities organized by phone code
 * Used in LocationStep and SearchView components
 */
export const citiesByCountryCode: Record<string, string[]> = {
  // Cameroon
  '+237': [
    "Yaoundé", "Douala", "Bafoussam", "Garoua", "Bamenda", "Maroua", "Ngaoundéré",
    "Bertoua", "Loum", "Kumba", "Edéa", "Kumbo", "Foumban", "Nkongsamba", "Limbe",
    "Kribi", "Ebolowa", "Sangmélima", "Mbalmayo", "Mfou", "Dschang", "Bafang",
    "Bandjoun", "Mbouda", "Batouri", "Yokadouma", "Kousséri", "Mora", "Kousseri",
    "Guider", "Pitoa", "Figuil", "Tcholliré", "Tibati", "Tiko", "Buea", "Muyuka"
  ],
  // France
  '+33': [
    "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg",
    "Montpellier", "Bordeaux", "Lille", "Rennes", "Reims", "Saint-Étienne", "Toulon",
    "Le Havre", "Grenoble", "Dijon", "Angers", "Nîmes", "Villeurbanne", "Saint-Denis",
    "Le Mans", "Aix-en-Provence", "Clermont-Ferrand", "Brest", "Limoges", "Tours",
    "Amiens", "Perpignan", "Metz", "Besançon", "Boulogne-Billancourt", "Orléans",
    "Mulhouse", "Rouen", "Caen", "Nancy", "Saint-Paul", "Argenteuil", "Roubaix"
  ],
  // Côte d'Ivoire
  '+225': [
    "Abidjan", "Bouaké", "Daloa", "Yamoussoukro", "Korhogo", "San-Pédro", "Man",
    "Gagnoa", "Divo", "Séguéla", "Abengourou", "Bondoukou", "Grand-Bassam", "Agboville",
    "Adzopé", "Anyama", "Bingerville", "Dabou", "Grand-Lahou", "Jacqueville",
    "Tiassalé", "Dimbokro", "Toumodi", "Béoumi", "Katiola", "Dabakala", "Ferkessédougou",
    "Boundiali", "Tingréla", "Odienné", "Touba", "Biankouma", "Danané", "Guiglo",
    "Duékoué", "Bangolo", "Bloléquin", "Tabou", "Sassandra", "Soubré"
  ],
  // Sénégal
  '+221': [
    "Dakar", "Thiès", "Kaolack", "Saint-Louis", "Ziguinchor", "Mbour", "Rufisque",
    "Louga", "Diourbel", "Kolda", "Tambacounda", "Richard-Toll", "Touba", "Guédiawaye",
    "Pikine", "Tivaouane", "Fatick", "Sédhiou", "Kédougou", "Matam", "Linguère",
    "Podor", "Dagana", "Kaffrine", "Saraya", "Vélingara", "Oussouye", "Bignona"
  ],
  // Burkina Faso
  '+226': [
    "Ouagadougou", "Bobo-Dioulasso", "Koudougou", "Banfora", "Ouahigouya", "Pouytenga",
    "Kaya", "Tenkodogo", "Fada N'Gourma", "Houndé", "Dédougou", "Gaoua", "Réo",
    "Ziniaré", "Manga", "Djibo", "Dori", "Gorom-Gorom", "Titao", "Tougan",
    "Nouna", "Solenzo", "Boromo", "Kongoussi", "Boulsa", "Yako", "Zorgho"
  ],
  // Gabon
  '+241': [
    "Libreville", "Port-Gentil", "Franceville", "Oyem", "Moanda", "Mouila", "Lambaréné",
    "Tchibanga", "Koulamoutou", "Makokou", "Bitam", "Mitzic", "Ndjolé", "Fougamou",
    "Lastoursville", "Okondja", "Lébamba", "Mayumba", "Gamba", "Omboué", "Setté Cama"
  ],
  // Congo
  '+242': [
    "Brazzaville", "Pointe-Noire", "Dolisie", "Nkayi", "Kindamba", "Impfondo", "Ouesso",
    "Madingou", "Sibiti", "Mossendjo", "Kinkala", "Boko", "Gamboma", "Ewo", "Makoua",
    "Owando", "Okoyo", "Boundji", "Loutété", "Zanaga", "Divénié", "Mindouli"
  ],
  // Democratic Republic of Congo
  '+243': [
    "Kinshasa", "Lubumbashi", "Mbuji-Mayi", "Kananga", "Kisangani", "Bukavu", "Goma",
    "Tshikapa", "Kolwezi", "Likasi", "Uvira", "Beni", "Butembo", "Mbandaka", "Matadi",
    "Kikwit", "Isiro", "Bandundu", "Gemena", "Ilebo", "Kalemie", "Kamina", "Lodja",
    "Mwene-Ditu", "Kabinda", "Kenge", "Lisala", "Boende", "Inongo", "Kindu"
  ]
};

/**
 * Cities organized by country code (2-letter ISO codes)
 * Alternative mapping for components that use ISO country codes
 */
export const citiesByISOCode: Record<string, string[]> = {
  'cm': citiesByCountryCode['+237'],
  'fr': citiesByCountryCode['+33'],
  'ci': citiesByCountryCode['+225'],
  'sn': citiesByCountryCode['+221'],
  'bf': citiesByCountryCode['+226'],
  'ga': citiesByCountryCode['+241'],
  'cg': citiesByCountryCode['+242'],
  'cd': citiesByCountryCode['+243']
};

/**
 * Neighborhoods organized by city
 * Used in LocationStep for detailed location selection
 */
export const neighborhoodsByCity: Record<string, string[]> = {
  // Cameroon cities
  "Yaoundé": [
    "Afanoya 1",
    "Afanoya 2",
    "Afanoya 3",
    "Afanoya 4",
    "Ahala 1",
    "Ahala 2",
    "Awae",
    "Bastos",
    "Biteng",
    "Centre commercial",
    "Cité Verte",
    "Dakar",
    "Efoulan",
    "Ekoudou",
    "Ekoumdoum",
    "Ekounou",
    "Elig-Edzoa",
    "Elig-Essono",
    "Emana",
    "Etam-Bafia",
    "Etoudi",
    "Etoa-Meki 1",
    "Etoa-Meki 2",
    "Febe",
    "Grand Messa",
    "Kondengui 1",
    "Madagascar",
    "Mballa 1",
    "Mballa 2",
    "Mballa 3",
    "Mebandan",
    "Melen 2",
    "Messa Carrière",
    "Messame-Ndongo",
    "Messassi",
    "Mekoumbou 1",
    "Mekoumbou 2",
    "Mimboman",
    "Mvan-Nord",
    "Mvog-Mbi",
    "Ndamvout",
    "Ngoa-Ekele 1",
    "Ngoa-Ekele 2",
    "Nkol-Ndongo 2",
    "Nkolmesseng 1",
    "Nkolondom",
    "Nkom-Kana",
    "Nkomo",
    "Nkoleton",
    "Nkolfon",
    "Nlong Mvolye",
    "Nlongkak",
    "Nsam",
    "Nsimeyong 1",
    "Nsimeyong 2",
    "Nsimeyong 3",
    "Ntouessong",
    "Ntoungou",
    "Nyom",
    "Obili",
    "Obobogo",
    "Odza",
    "Okolo",
    "Olembe",
    "Olezoa",
    "Oliga",
    "Tongolo",
    "Tsinga",
    "Manguier"
  ],
  "Douala": [
    "Akwa",
    "Akwa Nord",
    "Bali",
    "Bépanda",
    "Bependa",
    "Bependa Omnisport",
    "Bessengue",
    "Bonabéri",
    "Bonapriso",
    "Bonanjo",
    "Bonamoussadi",
    "Bonamoussadi Cité",
    "Denver",
    "Santa Barbara",
    "Kotto",
    "New Bell",
    "New-Bell Congo",
    "New-Bell Bandjoun",
    "Bassa (Zone Bassa)",
    "Logbaba",
    "Logbessou",
    "Logpom",
    "Makepe",
    "Japoma",
    "Deïdo",
    "New Deido",
    "Bonateki",
    "Bonatone",
    "Grand Moulin",
    "Bonamuti",
    "Cité des Palmiers",
    "Cité SIC",
    "Ndogbong",
    "Ndogbati",
    "Ndogsimbi",
    "Ndogpassi",
    "Ndokoti",
    "Nyalla",
    "Ngangue",
    "Mboppi",
    "Youpwé",
    "Dibamba-Bonaloka",
    "New Town Aéroport",
    "New Town",
    "Bonaloka",
    "Entrée de Billes",
    "Bobongo",
    "Boko",
    "Ndobo",
    "Ngwélé",
    "Mambanda",
    "Grand Hangar",
    "Besseke",
    "Nkombo",
    "Socaver",
    "Sic Cacao",
    "Quartier CCC",
    "Tractafric",
    "PK8",
    "PK9",
    "PK10",
    "PK13",
    "PK14",
    "PK21",
    "PK27",
    "Yassa",
    "Village",
    "Koumassi",
    "Essengue",
    "Cité des Douaniers"
  ],
  "Bafoussam": [
    "Bamendzi",
    "Banengo",
    "Djeleng I",
    "Djeleng II",
    "Famla (« Akwa »)",
    "Kamkop",
    "Quartier Évêché",
    "Quartier Haoussa",
    "Tamdja",
    "Gouache / Ngouache",
    "Toket",
    "Nylon",
    "Tyo",
    "Tyo-Ville",
    "Tyo-Village",
    "Ndianbou",
    "Ndiandam",
    "Ndianso",
    "Metto",
    "Mewehe",
    "Lemgwo",
    "Kena",
    "Keuleu",
    "Kouogouo",
    "Sachié",
    "Tougang",
    "Touhenyé",
    "Touhekououp",
    "Banefo",
    "Baye",
    "Badeng",
    "Bapi",
    "Djassa",
    "Djietcha",
    "Konti",
    "Yanmbah"
  ],
  "Bamenda": [
    "Azire",
    "Ntamulung",
    "Ntarikon",
    "Bayele",
    "Nitop",
    "New Layout",
    "Meta Quarter",
    "Small Mankon",
    "Big Mankon",
    "Old Town",
    "Mulang",
    "Musang",
    "Ntarinkon",
    "Alakuma",
    "Nitop 1",
    "Nitop 2",
    "Nitop 3",
    "Azire B",
    "Clerk’s Quarter",
    "Federal Quarters",
    "Government Residential",
    "Ntambeng",
    "Mende-Nkwe",
    "Mankon",
    "Nkwen",
    "Bamendakwe"
  ],
  "Garoua": [
    "Roumdé Adjia",
    "Garoua Plateau",
    "Plateau",
    "Bibémiré I",
    "Bibémiré II",
    "Bibémiré III",
    "Djamboutou",
    "Djamboutou Manga",
    "Djamboutou Plateau",
    "Djamboutou Petel",
    "Camp Chinois",
    "Yelwa",
    "Foulbéré",
    "Marouaré",
    "Nassarao",
    "Haoussaré",
    "Ngalbidje",
    "Takasko",
    "Ouro-Labbo",
    "Ouara-Talaka",
    "Kanadi",
    "Doualaré",
    "Nigériaré"
  ],
  "Dschang": [
    "Asseitsa",
    "Athoumeto",
    "Aza’a",
    "Aza’a Foreke-Dschang",
    "Azuenla",
    "Canne à Sucre",
    "Centre Commercial",
    "Dounga",
    "Famla",
    "Femteu",
    "Fiala (Foto) II",
    "Fiankop",
    "Fiankop I",
    "Fiankop II",
    "Génie Rural",
    "Haoussa et Mosquée",
    "Keuleng",
    "Leufock",
    "Makemtsa",
    "Makemtsa-Madagascar",
    "Mechieu",
    "Meka’a I",
    "Melang",
    "Minghong et Zemba",
    "Mingmeto",
    "Mingou",
    "Mosquée",
    "Ngui",
    "Nylon",
    "Tapalé",
    "Tchoualé I",
    "Tchoualé II",
    "Tsenfem",
    "Tsinbing",
    "Tsinkop",
    "Zemda"
  ],
  "Kribi": [
    "Massaka",
    "Ngoyè administratif",
    "Afan-Mabé",
    "New Town I",
    "New Town II",
    "Petit-Paris",
    "Mpalla",
    "Nziou",
    "Bibolo",
    "Dombe",
    "Mpolongwé I",
    "Mpolongwé II",
    "Londji I",
    "Londji II",
    "Elabé",
    "Bebambwe I",
    "Bebambwe II",
    "Ngoye-Wamie",
    "Ngoye-Réserve",
    "Ebome",
    "Eboundja I",
    "Eboundja II",
    "Bwambé",
    "Lolabé",
    "Louma / Grand Batanga I",
    "Grand Batanga II",
    "Lende-Dibé",
    "Mboamanga",
    "Mpangou",
    "Zaïre",
    "Loobé",
    "Port autonome de Kribi",
    "Mokolo (Kribi)"
  ],
  "Limbe": [
    "Down Beach",
    "New Town East",
    "New Town West",
    "Gardens",
    "Church Street",
    "Town Beach",
    "Cassava Farm (Middle Cassava Farms / Upper Cassava Farms)",
    "Motowoh (Lower / Middle / Upper Motowoh)",
    "Lumpsum",
    "GRA",
    "New Layout GRA",
    "Mbende",
    "Mbende West",
    "Unity Quarter",
    "Unity Quarter Annex",
    "Mabeta Road Layout",
    "Coconut Island",
    "Half Mile",
    "Mile One",
    "Mile Two",
    "Mile Four (Mile 4 / Bonadikombo)",
    "Mokunda",
    "Botaland / Bota Land",
    "Limbola",
    "Wovia",
    "Mokindi / Isokolo",
    "Ngeme",
    "Bobende",
    "Mokundange",
    "Batoke",
    "Lower Bosumbu",
    "Meveo me Mbenge",
    "Animal Farm",
    "Clerks Quarter",
    "Federal Quarter",
    "Custom Quarter"
  ],
  "Buea": [
    "Buea Town (Bokwaongo)", "Buea Station", "Great Soppo", "Small Soppo", "Molyko", "Muea", "Mile 16 (Bolifamba)", "Mile 17 (gare routière)",
    "Clerks Quarter", "Federal Quarter", "GRA (Government Residential Area)", "Bonduma", "Bomaka", "Bokwango", "Tole (Tole Tea Estate)",
    "Dibanda", "Bova", "Bojongo", "Likoko-Membea", "Bokova", "Bonakanda", "Small Soppo New Layout", "Molyko New Layout", "Bulu Camp (zone de Buea)",
    "Sandpit"
  ],
  "Ebolowa": [
    "Angalé", "Nko’ovos 1", "Nko’ovos 2", "New-Bell 1", "New-Bell 3", "New-Bell 4", "New-Bell 5",
    "Centre administratif / centre-ville", "Ekombité (zone de l’hôpital provincial)", "Abang", "Adjap-Biyeng",
    "Afanengong-Evele", "Akak-Essatolo", "Amvam-Yévol", "Eves", "Foulassi-Yembong", "Koungoulou-Biyeng", "Lo’o",
    "Ngalan", "Mekalat", "Mekalat-Yévol", "Mekalat-Biyen", "Essakoe", "Quartier Haoussa (quartier haoussa d’Ebolowa)",
    "Samba (zone du marché Samba)"
  ],
  "Mbalmayo": [
    "Centre ville",
    "Obeck",
    "Nkong Assi",
    "Mbockoulou",
    "Nseng Nlong I",
    "Nseng Nlong II",
    "Nseng Nlong III",
    "Nseng Nlong IV",
    "Oyack I",
    "Oyack II",
    "Ngallan",
    "Akomnyada I",
    "Akomnyada II",
    "Assanzoa",
    "Zamakoe",
    "Memiam",
    "Mekomo",
    "Nkolnyama",
    "Ngat Bane / Ngat Plantation",
    "Ekombité",
    "Nkolngock I",
    "Nkolngock II",
    "Nkoumadjap",
    "Avebe",
    "Mbedoumou"
  ],
  "Maroua": [
    "Domayo",
    "Hardé",
    "Pitoaré",
    "Founangue",
    "Kongola Djiddéo",
    "Djarengol",
    "Kodek",
    "Kodek Djarengol",
    "Palar",
    "Zokok",
    "Diguirwo",
    "Djoulgouf",
    "Ziling",
    "Barmaré",
    "Maoundiwo",
    "Louggeo",
    "Douggoï",
    "Doursoungo",
    "Sararé",
    "Ouro Lopé",
    "Ouro Bikordi",
    "Makabaye",
    "Meskine",
    "Koutbao",
    "Salak",
    "Pont Vert",
    "Ouro-Dolé"
  ],


  // France cities
  "Paris": ["Montmartre", "Le Marais", "Saint-Germain-des-Prés", "Champs-Élysées", "Belleville", "Bastille", "La Défense", "Montparnasse", "République", "Batignolles", "Opéra", "Latin Quarter"],
  "Marseille": ["Le Panier", "Vieux-Port", "La Canebière", "Noailles", "Endoume", "Castellane", "Belsunce", "Le Canet", "La Plaine", "Saint-Victor"],
  "Lyon": ["Vieux Lyon", "La Croix-Rousse", "Bellecour", "La Part-Dieu", "Confluence", "Guillotière", "Terreaux", "Perrache", "Fourvière", "Vaise"],
  "Toulouse": ["Capitole", "Saint-Cyprien", "Carmes", "Saint-Michel", "Minimes", "Rangueil", "Esquirol", "Saint-Aubin", "Compans-Caffarelli"],
  "Nice": ["Promenade des Anglais", "Vieux Nice", "Jean-Médecin", "Cimiez", "Port", "Gambetta", "Libération", "Riquier", "Arenas", "Saint-Roch"],

  // Côte d'Ivoire cities
  "Abidjan": ["Plateau", "Cocody", "Marcory", "Treichville", "Yopougon", "Abobo", "Adjamé", "Attécoubé", "Koumassi", "Port-Bouët", "Bingerville", "Anyama"],
  "Bouaké": ["Commerce", "Air France", "Belleville", "Koko", "Nimbo", "Sokoura", "Dar-es-Salam"],
  "Yamoussoukro": ["Centre ville", "Habitat", "Dioulakro", "Assabou", "220 Logements", "Millionnaire", "Morofé"],
  "Daloa": ["Commerce", "Tazibouo", "Gbokora", "Labia", "Kirmann", "Lobia", "Orly"],

  // Sénégal cities
  "Dakar": ["Plateau", "Médina", "Almadies", "Fann", "Mermoz", "Ouakam", "Yoff", "Sacré-Cœur", "Grand-Dakar", "Ngor", "Point E", "Liberté", "Pikine"],
  "Thiès": ["Centre ville", "Cité Lamy", "Sampathé", "Nguinth", "Mbour 1", "Mbour 2", "Mbour 3", "Hersent", "Thialy"],
  "Saint-Louis": ["Île Saint-Louis", "Sor", "Langue de Barbarie", "Guet Ndar", "Ndioloffène", "Léona", "Balacoss", "Diamaguene"],

  // Burkina Faso cities
  "Ouagadougou": ["Centre-ville", "Dapoya", "Paspanga", "Gounghin", "Zogona", "Tampouy", "Pissy", "Somgandé", "Tanghin", "Wemtenga"],
  "Bobo-Dioulasso": ["Centre-ville", "Sarfalao", "Accart-Ville", "Colma", "Bindougousso", "Kuinima", "Colsama", "Diarradougou"],

  // Gabon cities
  "Libreville": ["Centre-ville", "Louis", "Mont-Bouët", "Glass", "Lalala", "Nkembo", "Oloumi", "Awendjé", "Batterie IV", "Akébé", "Sotega"],
  "Port-Gentil": ["Centre-ville", "Grand Village", "Balise", "Matiti", "Ntchengué", "Sogara"],

  // Congo cities
  "Brazzaville": ["Centre-ville", "Bacongo", "Poto-Poto", "Moungali", "Ouenzé", "Talangaï", "Mfilou", "Madibou", "Djiri"],
  "Pointe-Noire": ["Centre-ville", "Lumumba", "Mahouata", "Tié-Tié", "Loandjili", "Mongo-Poukou", "Ngoyo", "Mbota"],

  // Democratic Republic of Congo cities
  "Kinshasa": ["Gombe", "Lingwala", "Barumbu", "Kinshasa", "Kintambo", "Ngaliema", "Mont Ngafula", "Lemba", "Limete", "Matete", "Ndjili", "Masina"],
  "Lubumbashi": ["Centre-ville", "Kenya", "Ruashi", "Katuba", "Kamalondo", "Kampemba", "Annexe"]
};

/**
 * Travel options for location services
 */
export const travelOptions = [
  "Reçois", "Se déplace", "Reçois / Se déplace"
];

/**
 * Skin tone options with colors for search filters
 * @deprecated Use appearanceFilters instead for consistency
 */
export const skinTones = [
  { id: 'Noir', label: 'Noir(e)', color: '#3d0c02' },
  { id: 'Brun', label: 'Brun(e)', color: '#6f4e37' },
  { id: 'Métis', label: 'Métis(se)', color: '#d8a373' },
  { id: 'Blanc', label: 'Blanc(he)', color: '#ffe0bd' },
  { id: 'Ébène', label: 'Ébène', color: '#1a0a05' }
];

/**
 * Partner type options for search filters
 */
export const partnerTypes = [
  { id: 'femme', label: 'Femme', icon: 'female' },
  { id: 'homme', label: 'Homme', icon: 'male' },
  { id: 'sexcam', label: 'Sexcam', icon: 'videocam' },
  { id: 'menage', label: 'Ménage à 3', icon: 'group' },
  { id: 'orgie', label: 'Orgie', icon: 'group_add' }
];

/**
 * User type options for search filters
 * Matches the actual userType values in the User interface
 */
export const userTypeFilters = [
  { id: 'femme', label: 'Femme', icon: 'female', color: '#ec4899' },
  { id: 'homme', label: 'Homme', icon: 'male', color: '#3b82f6' },
  { id: 'couple', label: 'Couple', icon: 'favorite', color: '#f59e0b' },
  { id: 'autres', label: 'Autres', icon: 'group', color: '#8b5cf6' }
];

/**
 * LGBTQ+ options for search filters
 */
export const lgbtqOptions = [
  { id: 'lesbienne', label: 'Lesbienne', icon: 'female' },
  { id: 'bisexuel', label: 'Bisexuel', icon: 'male' },
  { id: 'transgenre', label: 'Transgenre', icon: 'transgender' }
];

/**
 * Physical attributes including intimate and special options
 */
export const physicalAttributes = [
  // Intimate attributes
  { id: 'rasee', label: 'Rasée', category: 'intime', icon: 'content_cut' },
  { id: 'poilue', label: 'Poilue', category: 'intime', icon: 'spa' },

  // Délires with added icons
  { id: "sexcam", label: "Sexcam", category: 'delires', icon: "videocam" },
  { id: "plan_a_3", label: "Plan à 3", category: 'delires', icon: "group" },
  { id: "massages", label: "Massages", category: 'delires', icon: "spa" },
  { id: "annulingus", label: "Annulingus", category: 'delires', icon: "favorite" },
  { id: 'fumeur', label: 'Fumeur(se)', category: 'delires', icon: 'smoking_rooms' },
  { id: 'gode', label: 'Gode', category: 'delires', icon: 'fitness_center' },
  { id: 'tatouages', label: 'Tatouages', category: 'delires', icon: 'brush' },
  { id: 'percings', label: 'Percings', category: 'delires', icon: 'auto_awesome' },
  { id: 'enceinte', label: 'Enceinte', category: 'delires', icon: 'pregnant_woman' },
  { id: 'fontaine', label: 'Fontaine', category: 'delires', icon: 'water_drop' },
  { id: 'sans_preso', label: 'Sans préso', category: 'delires', icon: 'block' },
  { id: 'anal', label: 'Anal', category: 'delires', icon: 'circle' },
  { id: "strip_tease", label: "Strip-tease", category: 'delires', icon: "whatshot" },
  { id: "sexe_dehors", label: "Sexe dehors", category: 'delires', icon: "park" },
  { id: "orgie", label: "Orgie", category: 'delires', icon: "group" },
];

/**
 * Chest size options for search filters
 */
export const chestSizes = [
  { id: 'enorme', label: 'Énorme', icon: 'add_circle' },
  { id: 'grosse', label: 'Grosse', icon: 'add' },
  { id: 'moyenne_chest', label: 'Moyenne', icon: 'remove' },
  { id: 'petite', label: 'Petite', icon: 'remove_circle' }
];

/**
 * Body type options for search filters
 */
export const bodyTypes = [
  { id: 'bbw', label: 'BBW', icon: 'panorama_horizontal' },
  { id: 'ronde', label: 'Ronde', icon: 'circle' },
  { id: 'moyenne_body', label: 'Moyenne', icon: 'crop_square' },
  { id: 'skinny', label: 'Skinny', icon: 'straighten' }
];

/**
 * Age group options for search filters
 */
export const ageGroups = [
  { id: 'jeune', label: 'Jeune (+18)', icon: 'person' },
  { id: 'intermediaire', label: 'Intermédiaire (+28)', icon: 'person' },
  { id: 'mature', label: 'Mature(+38)', icon: 'person' }
];
