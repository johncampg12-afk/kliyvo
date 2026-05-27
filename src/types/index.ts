export type Property = {
  id: string;
  title: string;
  price: number;
  location: any; // We'll type this strictly with PostGIS geometry later
};
