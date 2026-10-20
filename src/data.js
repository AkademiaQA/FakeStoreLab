const catalog = [
  ['Northstar Air 14', 3499, 'laptops', 'Laptop 14" IPS 1920x1200, AMD Ryzen 5 7530U, 16 GB RAM, SSD 512 GB, Windows 11 Home. Aluminiowa obudowa, masa 1,4 kg.'],
  ['Northstar Pro 16', 6299, 'laptops', 'Laptop 16" IPS 2560x1600, Intel Core i7-13700H, 32 GB RAM, SSD 1 TB, Windows 11 Pro. Dwa porty Thunderbolt 4.'],
  ['Vertex Game 15', 4999, 'laptops', 'Laptop gamingowy 15,6" Full HD 144 Hz, AMD Ryzen 7 7735HS, GeForce RTX 4060 8 GB, 16 GB RAM, SSD 1 TB.'],
  ['Northstar Study 15', 2299, 'laptops', 'Laptop 15,6" Full HD, Intel Core i3-1315U, 8 GB RAM, SSD 256 GB, Windows 11 Home. Kamera i klawiatura numeryczna.'],
  ['Vertex Studio 16', 7999, 'laptops', 'Laptop do grafiki: ekran OLED 16" 3.2K, Intel Core i9-13900H, GeForce RTX 4070, 32 GB RAM, SSD 2 TB.'],
  ['Northstar Travel 13', 4199, 'laptops', 'Ultrabook 13,3" IPS, AMD Ryzen 5 7640U, 16 GB RAM, SSD 512 GB. Masa 1,1 kg, akumulator 60 Wh, USB-C Power Delivery.'],
  ['Vertex Office SFF', 2499, 'desktops', 'Kompaktowy komputer biurowy, Intel Core i5-13400, 16 GB DDR4, SSD 512 GB, Windows 11 Pro, Wi-Fi 6.'],
  ['Vertex Gaming R5', 4599, 'desktops', 'Komputer gamingowy, AMD Ryzen 5 7600, GeForce RTX 4060 8 GB, 32 GB DDR5, SSD NVMe 1 TB, zasilacz 650 W.'],
  ['Vertex Gaming R7', 6999, 'desktops', 'Komputer gamingowy, AMD Ryzen 7 7800X3D, GeForce RTX 4070 Super, 32 GB DDR5, SSD NVMe 2 TB, zasilacz 750 W.'],
  ['Northstar Mini M5', 1899, 'desktops', 'Mini PC, AMD Ryzen 5 5560U, 16 GB RAM, SSD 512 GB, dwa HDMI, Ethernet 1 Gb/s. Uchwyt VESA w zestawie.'],
  ['Vertex Workstation W9', 11999, 'desktops', 'Stacja robocza, Intel Core i9-14900K, GeForce RTX 4080 Super, 64 GB DDR5, SSD NVMe 2 TB, zasilacz 1000 W.'],
  ['Northstar Home AIO 24', 3299, 'desktops', 'Komputer All-in-One z ekranem 23,8" Full HD IPS, Intel Core i5-1235U, 16 GB RAM, SSD 512 GB. Klawiatura i mysz w zestawie.'],
  ['Clearview Office 24', 599, 'monitors', 'Monitor 23,8" IPS, Full HD, 100 Hz, HDMI i DisplayPort. Regulacja pochylenia, mocowanie VESA 100x100 mm.'],
  ['Clearview Pro 27', 1299, 'monitors', 'Monitor 27" IPS, 2560x1440, 75 Hz, pokrycie 100% sRGB. USB-C 65 W, regulacja wysokosci i pivot.'],
  ['Clearview Gaming 27', 1599, 'monitors', 'Monitor gamingowy 27" Fast IPS, 2560x1440, 180 Hz, czas reakcji 1 ms, Adaptive Sync, HDMI i DisplayPort.'],
  ['Clearview Studio 32', 2799, 'monitors', 'Monitor 31,5" IPS, 3840x2160, 60 Hz, 95% DCI-P3, USB-C 90 W i hub USB. Fabryczna kalibracja kolorow.'],
  ['Clearview UltraWide 34', 2199, 'monitors', 'Zakrzywiony monitor 34" VA, 3440x1440, 144 Hz, proporcje 21:9. DisplayPort, HDMI i regulacja wysokosci.'],
  ['Clearview Portable 16', 899, 'monitors', 'Przenosny monitor 15,6" IPS, Full HD, 60 Hz. Obraz i zasilanie przez USB-C, mini HDMI, etui z podstawka.'],
  ['Keycraft Mechanical TKL', 349.99, 'accessories', 'Klawiatura mechaniczna TKL, przelaczniki Brown, uklad US ANSI, podswietlenie RGB, odlaczany przewod USB-C.'],
  ['Keycraft Wireless Mouse', 149.99, 'accessories', 'Bezprzewodowa mysz optyczna, 4000 DPI, Bluetooth i odbiornik USB 2,4 GHz. Szescioprzyciskowa obudowa i akumulator USB-C.'],
  ['Portlink Dock 8-in-1', 299.99, 'accessories', 'Stacja dokujaca USB-C: HDMI 4K 60 Hz, Ethernet 1 Gb/s, 3x USB-A, czytniki SD i microSD, Power Delivery do 100 W.'],
  ['Datavault NVMe 1 TB', 329.99, 'accessories', 'Dysk SSD M.2 2280, PCIe 4.0 x4, pojemnosc 1 TB. Odczyt do 7000 MB/s, zapis do 5000 MB/s, pamiec TLC.'],
  ['Keycraft Desk Headset', 249.99, 'accessories', 'Sluchawki nauszne USB z mikrofonem kierunkowym, przetworniki 40 mm, regulacja glosnosci na przewodzie.'],
  ['Portlink Webcam FHD', 199.99, 'accessories', 'Kamera internetowa Full HD 60 FPS, autofocus, dwa mikrofony, przeslona obiektywu, USB-A i uchwyt monitorowy.'],
];

const categoryImages = { laptops: 0, desktops: 1, monitors: 2, accessories: 3 };

export const products = catalog.map(([title, price, category, description], index) => ({
  id: index + 1,
  title,
  price,
  description,
  category,
  image: `/images/product-${categoryImages[category]}.svg`,
}));

const accounts = [
  ['anna.kowalska', 'anna.kowalska@example.com', 'Kawa!Rano2026'],
  ['piotr.nowak', 'piotr.nowak@example.com', 'Rower#Szlak84'],
  ['magdalena.wisniewska', 'magdalena.wisniewska@example.com', 'Las!Jesien2026'],
  ['tomasz.wojcik', 'tomasz.wojcik@example.com', 'Kompas#Gory72'],
  ['katarzyna.kaminska', 'katarzyna.kaminska@example.com', 'Herbata!Mieta9'],
  ['michal.lewandowski', 'michal.lewandowski@example.com', 'Pociag#Peron42'],
  ['aleksandra.zielinska', 'aleksandra.zielinska@example.com', 'Ogrod!Lawenda8'],
  ['pawel.szymanski', 'pawel.szymanski@example.com', 'Kajak#Jezioro31'],
  ['natalia.wozniak', 'natalia.wozniak@example.com', 'Ksiazka!Wieczor7'],
  ['marcin.dabrowski', 'marcin.dabrowski@example.com', 'Aparat#Podroz56'],
  ['julia.kozlowska', 'julia.kozlowska@example.com', 'Muzyka!Plyta24'],
  ['krzysztof.jankowski', 'krzysztof.jankowski@example.com', 'Szachy#Skoczek6'],
];

export const users = accounts.map(([username, email, password], index) => ({
  id: index + 1,
  username,
  email,
  password,
}));

export const carts = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  userId: index % users.length + 1,
  products: products.slice(index, index + 2).map(product => ({ ...product })),
}));

export const collections = { products, carts, users };
export const categories = [...new Set(products.map(product => product.category))].sort();
