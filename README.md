# GoFetch! - Moderna platforma za pronalazak pouzdanih šetača pasa u vašoj blizini

# Opis projekta
Ovaj projekt je reultat timskog rada u sklopu projeknog zadatka kolegija [Programsko inženjerstvo](https://www.fer.unizg.hr/predmet/proinz) na Fakultetu elektrotehnike i računarstva Sveučilišta u Zagrebu.

Današnji ubrzani svijet pun gužve je znatno otežao vlasnicima pasa da pronađu vremena za šetnje sa svojim ljubimcem. Srećom tu je GoFetch!, moderna platforma koja povezuje vlasnike s provjerenim lokalnim šetačima. Bez obzira jeste li zaglavili u prometu, imate li viška obaveza ili vam je samo potrebna dodatna pomoć - GoFetch! vam pomaže osigurati da vaš krzneni prijatelj dobije ono što zaslužuje te šetačima omogućuje zabavan način za brzu zaradu.

### ❤️ Naša misija
Jer svaki pas zaslužuje šetnju - GoFetch! omogućuje jednostavno, pouzdano i gotovo bezbrižno povezivanje vlasnika i šetača pasa na jednom mjestu. Sljedeća avantura vašeg psa udaljena je samo jedan klik

# Funkcijski zahtjevi

| **ID zahtjeva** | **Opis** | **Prioritet** | **Izvor** | **Kriteriji prihvaćanja** |
|------------------|-----------|----------------|-------------|-----------------------------|
| F-001 | Sustav omogućuje registraciju i autentifikaciju korisnika (vlasnik/šetač) putem OAuth 2.0. | Visok | Zahtjev dionika | Korisnik se može registrirati i prijaviti putem vanjskog servisa. |
| F-002 | Sustav omogućuje online načine plaćanja (osim gotovine), podržava PayPal i kreditne kartice. | Visok | Dokument projekta | Korisnik može uspješno izvršiti uplatu putem PayPal-a ili kreditne kartice. |
| F-003 | Sustav omogućuje rezervaciju i pregled rezervacija termina šetnje. | Visok | Zahtjev dionika | Korisnik može rezervirati termin i pregledati rezervacije. |
| F-004 | Sustav omogućuje otkazivanje rezerviranog termina šetnje. | Visok | Dokument projekta | Korisnik može otkazati rezervaciju najkasnije 24h prije termina šetnje. |
| F-005 | Sustav omogućuje slanje obavijesti korisnicima za nadolazeće rezervacije. | Srednji | Povratne informacije korisnika | Korisnik prima obavijest e-mailom ili push notifikacijom. |
| F-006 | Sustav omogućuje komunikaciju između korisnika (vlasnik–šetač), slanje poruka i fotografija. | Srednji | Dokument projekta | Korisnici mogu razmjenjivati poruke i slike putem integriranog kom. kanala (npr. FreeChat). |
| F-007 | Sustav omogućuje pretraživanje i filtriranje korisnika po određenim značajkama profila. | Visok | Zahtjev dionika | Korisnik može pretraživati šetače po kriterijima (poput: lokacije, cijene, dostupnosti i ocjene). |
| F-008 | Sustav omogućuje recenziranje i dokumentiranje povratne informacije za korisnike nakon šetnje. | Visok | Dokument projekta | Nakon završene šetnje, vlasnik može ostaviti ocjenu (1–5) i komentar. |
| F-009 | Sustav omogućuje hijerarhiju korisnika (administrator / korisnik). | Srednji | Dokument projekta | Administrator ima pristup administracijskom sučelju za upravljanje korisnicima i sadržajem. |

# Nefunkcijski zahtjevi

| **ID zahtjeva** | **Opis** | **Prioritet** |
|------------------|-----------|----------------|
| NF-1.1 | Korisnički podaci se pohranjuju i zaštićeni su od neovlaštenog pristupa. | Visok | 
| NF-1.2 | Sustav sprječava dupliciranje korisničkih podataka. | Visok | 
| NF-3.1 | Korisnici mogu jednostavno mijenjati detalje rezervacije. | Srednji | 
| NF-4.1 | Korisnik ne može otkazati rezervaciju unutar posljednja 24 sata prije početka termina. | Visok |
| NF-5.1 | Obavijesti moraju biti kratke, jasne i razumljive. | Srednji | 
| NF-5.2 | Sustav šalje različite vrste obavijesti za vlasnike i šetače. | Srednji | 
| NF-8.1 | Recenzije su javno vidljive svim korisnicima. | Srednji |
| NF-9.1 | Administrator može učinkovito upravljati korisnicima i njihovim podacima. | Visok | 

# Tehnologije
Front-end: React, JS <br>
Back-end: Java <br>
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
