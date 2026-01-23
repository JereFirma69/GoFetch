# GoFetch! - Moderna platforma za pronalazak pouzdanih šetača pasa u vašoj blizini
[PawPal](https://gofetch-pawpal.vercel.app)
-------------------------------
Login info za testiranje:

  šetać:    mail - "testwalker@pawpal.com"
            pass - "test"
            
  vlasnik:  mail - "testowner@pawpal.com"
            pass - "test"
            
  admin:    mail - "admin@pawpal.com"
            pass - "admin"

  
# Opis projekta
Ovaj projekt je reultat timskog rada u sklopu projeknog zadatka kolegija [Programsko inženjerstvo](https://www.fer.unizg.hr/predmet/proinz) na Fakultetu elektrotehnike i računarstva Sveučilišta u Zagrebu.

Današnji ubrzani svijet pun gužve je znatno otežao vlasnicima pasa da pronađu vremena za šetnje sa svojim ljubimcem. Srećom tu je GoFetch!, moderna platforma koja povezuje vlasnike s provjerenim lokalnim šetačima. Bez obzira jeste li zaglavili u prometu, imate li viška obaveza ili vam je samo potrebna dodatna pomoć - GoFetch! vam pomaže osigurati da vaš krzneni prijatelj dobije ono što zaslužuje te šetačima omogućuje zabavan način za brzu zaradu.

### ❤️ Naša misija
Jer svaki pas zaslužuje šetnju - GoFetch! omogućuje jednostavno, pouzdano i gotovo bezbrižno povezivanje vlasnika i šetača pasa na jednom mjestu. Sljedeća avantura vašeg psa udaljena je samo jedan klik

# Funkcijski zahtjevi

| **ID zahtjeva** | **Naziv zahtjeva** | **Opis** | **Prioritet** | **Izvor** | **Kriteriji prihvaćanja** |
|------------------|--------------------|-----------|----------------|-------------|-----------------------------|
| FZ-001 | Registracija i autentifikacija korisnika | Sustav omogućuje registraciju i autentifikaciju korisnika (vlasnik/šetač) putem OAuth 2.0. | Visok | Zahtjev dionika | Korisnik se može registrirati i prijaviti putem vanjskog servisa. |
| FZ-002 | Online plaćanja | Sustav omogućuje online načine plaćanja (osim gotovine), podržava PayPal i kreditne kartice. | Visok | Dokument projekta | Korisnik može uspješno izvršiti uplatu putem PayPal-a ili kreditne kartice. |
| FZ-003 | Rezervacija termina | Sustav omogućuje rezervaciju i pregled rezervacija termina šetnje. | Visok | Zahtjev dionika | Korisnik može rezervirati termin i pregledati rezervacije. |
| FZ-004 | Otkazivanje rezervacija | Sustav omogućuje otkazivanje rezerviranog termina šetnje. | Visok | Dokument projekta | Korisnik može otkazati rezervaciju najkasnije 24h prije termina šetnje. |
| FZ-005 | Obavijesti korisnicima | Sustav omogućuje slanje obavijesti korisnicima za nadolazeće rezervacije. | Srednji | Povratne informacije korisnika | Korisnik prima obavijest e-mailom ili push notifikacijom. |
| FZ-006 | Komunikacija korisnika | Sustav omogućuje komunikaciju između korisnika (vlasnik–šetač), slanje poruka i fotografija. | Srednji | Dokument projekta | Korisnici mogu razmjenjivati poruke i slike putem integriranog komunikacijskog kanala (npr. FreeChat). |
| FZ-007 | Pretraživanje i filtriranje | Sustav omogućuje pretraživanje i filtriranje korisnika po određenim značajkama profila. | Visok | Zahtjev dionika | Korisnik može pretraživati šetače po kriterijima (lokacija, cijena, dostupnost, ocjena). |
| FZ-008 | Recenzije i ocjene | Sustav omogućuje recenziranje i davanje povratnih informacija nakon šetnje. | Visok | Dokument projekta | Nakon završene šetnje, vlasnik može ostaviti ocjenu (1–5) i komentar. |
| FZ-009 | Hijerarhija korisnika | Sustav omogućuje hijerarhiju korisnika (administrator / korisnik). | Srednji | Dokument projekta | Administrator ima pristup administracijskom sučelju za upravljanje korisnicima i sadržajem. |
| FZ-010 | Uređivanje profila | Korisnik može uređivati osobne podatke (ime, opis, sliku profila, kontakt). | Srednji | Dokument projekta | Promjene se spremaju i vidljive su pri sljedećem prijavljivanju. |
| FZ-011 | Upravljanje rasporedom | Šetač može definirati i uređivati dostupne termine za šetnju. | Srednji | Zahtjev dionika | Novi termini se spremaju i prikazuju vlasnicima pasa. |
| FZ-012 | Upravljanje kućnim ljubimcima | Vlasnik može dodavati, uređivati i brisati podatke o svojim psima (ime, pasmina, napomene). | Visok | Povratne informacije korisnika | Pas je povezan s profilom vlasnika i može se koristiti u rezervacijama. |
| FZ-013 | Verifikacija šetača | Šetači moraju potvrditi identitet (npr. dokument ili potvrda administratora). | Srednji | Dokument projekta | Status verifikacije prikazan u profilu šetača. |
| FZ-014 | Povijest šetnji | Korisnik može pregledati povijest svih obavljenih šetnji. | Srednji | Zahtjev dionika | Popis prikazuje datume, trajanje i ocjene svake šetnje. |
| FZ-015 | Resetiranje lozinke | Sustav omogućuje resetiranje lozinke putem e-maila. | Visok | Povratne informacije korisnika | Korisnik može postaviti novu lozinku putem sigurnosnog linka. |
| FZ-016 | Višestruke uloge korisnika | Korisnik može imati i ulogu vlasnika i ulogu šetača. | Nizak | Dokument projekta | Korisnik može prebacivati između uloga u profilu. |
| FZ-017 | Prijava problema i podrška | Korisnik može prijaviti tehnički problem ili nepravilnost putem obrasca. | Nizak | Povratne informacije korisnika | Poruka se sprema i administrator prima obavijest. |
| FZ-018 | Administratorski nadzor | Administrator može pregledavati korisnike, recenzije i rezervacije te ih uređivati ili brisati. | Srednji | Dokument projekta | Administrator ima pristup kontrolnoj ploči s funkcijama upravljanja. |

<br>

# Nefunkcijski zahtjevi

| **ID zahtjeva** | **Naziv zahtjeva** | **Opis** | **Prioritet** | **Izvor** | **Kriteriji prihvaćanja** |
|------------------|--------------------|-----------|----------------|-------------|-----------------------------|
| NFZ-001 | Performanse | Sustav mora učitavati glavne stranice unutar 3 sekunde. | Srednji | Dokument projekta | 95% zahtjeva ima vrijeme odgovora kraće od 3 sekunde. |
| NFZ-002 | Skalabilnost | Sustav mora podržati do 10 000 korisnika bez značajnog pada performansi. | Nizak | Dokument projekta | Sustav ostaje responzivan i stabilan pri većem opterećenju. |
| NFZ-003 | Sigurnost podataka | Lozinke se moraju spremati hashirano, a komunikacija enkriptirana (HTTPS). | Visok | Zahtjev dionika | Nema plain-text lozinki; svi endpointi koriste HTTPS. |
| NFZ-004 | Autentikacija i autorizacija | Sustav koristi OAuth 2.0 ili JWT za sigurno upravljanje sesijama. | Visok | Dokument projekta | Tokeni se ispravno generiraju, validiraju i istječu nakon roka. |
| NFZ-005 | Upotrebljivost | Korisničko sučelje mora biti intuitivno, pregledno i responzivno (desktop/mobilno). | Visok | Povratne informacije korisnika | Testni korisnici mogu obaviti osnovne radnje bez pomoći. |
| NFZ-006 | Pouzdanost | Sustav mora biti dostupan i raditi 99% vremena bez zastoja u produkciji. | Srednji | Dokument projekta | Mjesečni downtime manji od 1%. |
| NFZ-007 | Kompatibilnost | Aplikacija mora raditi na modernim preglednicima (Chrome, Edge, Firefox). | Srednji | Dokument projekta | Aplikacija uspješno prolazi testiranja na minimalno 3 preglednika. |
| NFZ-008 | Lokalizacija | Sučelje mora podržavati hrvatski jezik i mogućnost dodavanja dodatnih jezika. | Nizak | Zahtjev dionika | Tekstovi su dostupni kroz JSON resurse ili datoteke za prijevod. |
| NFZ-009 | Privatnost | Osobni podaci korisnika koriste se isključivo u svrhu funkcioniranja aplikacije. | Visok | Dokument projekta | Sustav je u skladu s GDPR smjernicama. |
| NFZ-010 | Oporavak od greške | Sustav se mora moći oporaviti nakon greške bez gubitka podataka. | Srednji | Dokument projekta | Simulacija greške ne uzrokuje trajni gubitak ili korupciju podataka. |

# Tehnologije
Front-end: React, JS <br>
Back-end: .NET, C# <br>
Baza podataka: PostgreSQL <br>

# Instalacija

# Članovi tima 
> [Jure Kovačević](https://github.com/jurekova) <br>
> [Dorian Jerčić](https://github.com/JereFirma69) <br>
> [Matija Relić](https://github.com/Relifoks743) <br>
> [Anja Čerkez](https://github.com/AnjaCerkez) <br>
> [Davor Žic](https://github.com/davor-zic) <br>
> [Roko Stapić](https://github.com/rs-fer) <br>
> [Erna Topalović](https://github.com/ernafer) <br>

# Kontribucije
>Pravila ovise o organizaciji tima i su često izdvojena u CONTRIBUTING.md

# 📝 Kodeks ponašanja [![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
Kao studenti sigurno ste upoznati s minimumom prihvatljivog ponašanja definiran u [KODEKS PONAŠANJA STUDENATA FAKULTETA ELEKTROTEHNIKE I RAČUNARSTVA SVEUČILIŠTA U ZAGREBU](https://www.fer.hr/_download/repository/Kodeks_ponasanja_studenata_FER-a_procisceni_tekst_2016%5B1%5D.pdf), te dodatnim naputcima za timski rad na predmetu [Programsko inženjerstvo](https://wwww.fer.hr).
Očekujemo da ćete poštovati [etički kodeks IEEE-a](https://www.ieee.org/about/corporate/governance/p7-8.html) koji ima važnu obrazovnu funkciju sa svrhom postavljanja najviših standarda integriteta, odgovornog ponašanja i etičkog ponašanja u profesionalnim aktivnosti. Time profesionalna zajednica programskih inženjera definira opća načela koja definiranju  moralni karakter, donošenje važnih poslovnih odluka i uspostavljanje jasnih moralnih očekivanja za sve pripadnike zajenice.

Kodeks ponašanja skup je provedivih pravila koja služe za jasnu komunikaciju očekivanja i zahtjeva za rad zajednice/tima. Njime se jasno definiraju obaveze, prava, neprihvatljiva ponašanja te  odgovarajuće posljedice (za razliku od etičkog kodeksa). U ovom repozitoriju dan je jedan od široko prihvačenih kodeks ponašanja za rad u zajednici otvorenog koda.
>### Poboljšajte funkcioniranje tima:
>* definirajte načina na koji će rad biti podijeljen među članovima grupe
>* dogovorite kako će grupa međusobno komunicirati.
>* ne gubite vrijeme na dogovore na koji će grupa rješavati sporove primjenite standarde!
>* implicitno podrazmijevamo da će svi članovi grupe slijediti kodeks ponašanja.

# 📝 Licenca
Važeća (1)
[![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa]

Ovaj repozitorij sadrži otvoreni obrazovni sadržaji (eng. Open Educational Resources)  i licenciran je prema pravilima Creative Commons licencije koja omogućava da preuzmete djelo, podijelite ga s drugima uz 
uvjet da navođenja autora, ne upotrebljavate ga u komercijalne svrhe te dijelite pod istim uvjetima [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License HR][cc-by-nc-sa].
>
> ### Napomena:
>
> Svi paketi distribuiraju se pod vlastitim licencama.
> Svi upotrijebleni materijali  (slike, modeli, animacije, ...) distribuiraju se pod vlastitim licencama.

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: https://creativecommons.org/licenses/by-nc/4.0/deed.hr 
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg

Orginal [![cc0-1.0][cc0-1.0-shield]][cc0-1.0]
>
>COPYING: All the content within this repository is dedicated to the public domain under the CC0 1.0 Universal (CC0 1.0) Public Domain Dedication.
>
[![CC0-1.0][cc0-1.0-image]][cc0-1.0]

[cc0-1.0]: https://creativecommons.org/licenses/by/1.0/deed.en
[cc0-1.0-image]: https://licensebuttons.net/l/by/1.0/88x31.png
[cc0-1.0-shield]: https://img.shields.io/badge/License-CC0--1.0-lightgrey.svg

### Reference na licenciranje repozitorija

# Izvor medijskih sadržaja
- Sve fotografije preuzete su s Pexels [link:https://www.pexels.com/]
