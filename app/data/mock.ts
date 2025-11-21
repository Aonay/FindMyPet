export type PetRecord = {
  id: string;
  name: string;
  lastSeen: string;
  species: string;
  breed: string;
  color: string;
  eyeColor: string;
  size: string;
  status: "perda" | "encontro" | "arquivado";
  description: string;
  distance: string;
};

export const currentUser = {
  name: "Fulano",
  email: "usuario@email.com",
};

export const nearbyRecords: PetRecord[] = [
  {
    id: "1",
    name: "Bidu",
    lastSeen: "Rua das Flores, 21",
    species: "Cachorro",
    breed: "SRD",
    color: "Caramelo",
    eyeColor: "Castanho",
    size: "Medio",
    status: "encontro",
    description: "Visto brincando em pracinha.",
    distance: "450m",
  },
  {
    id: "2",
    name: "Bolota",
    lastSeen: "Av. Norte, 99",
    species: "Gato",
    breed: "Siames",
    color: "Cinza",
    eyeColor: "Azul",
    size: "Pequeno",
    status: "perda",
    description: "Assustado, miando bastante.",
    distance: "1.1km",
  },
];

export const matchRecords: PetRecord[] = [
  {
    id: "3",
    name: "Luna",
    lastSeen: "Parque Central",
    species: "Gato",
    breed: "Angora",
    color: "Branco",
    eyeColor: "Verde",
    size: "Pequeno",
    status: "encontro",
    description: "Parecido com ultimo registro de perda.",
    distance: "800m",
  },
];

export const userRecords: PetRecord[] = [
  {
    id: "4",
    name: "Pipoca",
    lastSeen: "Rua Azul, 50",
    species: "Cachorro",
    breed: "Pug",
    color: "Bege",
    eyeColor: "Preto",
    size: "Pequeno",
    status: "perda",
    description: "Sumiu perto da escola.",
    distance: "2km",
  },
  {
    id: "5",
    name: "Thor",
    lastSeen: "Av. Brasil, 12",
    species: "Cachorro",
    breed: "Golden",
    color: "Dourado",
    eyeColor: "Mel",
    size: "Grande",
    status: "encontro",
    description: "Registrado no parque.",
    distance: "3km",
  },
  {
    id: "6",
    name: "Mimo",
    lastSeen: "Rua Amaral, 2",
    species: "Gato",
    breed: "Siames",
    color: "Creme",
    eyeColor: "Azul",
    size: "Pequeno",
    status: "arquivado",
    description: "Caso resolvido.",
    distance: "5km",
  },
];
