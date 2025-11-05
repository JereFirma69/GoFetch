CREATE TABLE Korisnik

(

  id_korisnik SERIAL NOT NULL,

  email_korisnik VARCHAR(100) NOT NULL,

  lozinka_korisnik VARCHAR(20) NOT NULL,

  PRIMARY KEY (id_korisnik),

  UNIQUE (email_korisnik)

);



CREATE TABLE Vlasnik

(
	
	id_korisnik INT NOT NULL,
	
  PRIMARY KEY (id_korisnik),
	
  FOREIGN KEY (id_korisnik) REFERENCES Korisnik(id_korisnik) ON DELETE CASCADE
	
);



CREATE TABLE Pretplata_Vlasnik_SetacNovosti (
	
  id_korisnik INT NOT NULL,
	
  PRIMARY KEY (id_korisnik),
	
  FOREIGN KEY (id_korisnik) REFERENCES Vlasnik(id_korisnik) ON DELETE CASCADE
	
);



CREATE TABLE Setac

(

  id_korisnik INT NOT NULL,

  ime_setac VARCHAR(50) NOT NULL,

  prezime_setac VARCHAR(50) NOT NULL,

  profilna_setac VARCHAR(100) NOT NULL,

  lokacija_setac VARCHAR(100) NOT NULL,

  telefon_setac VARCHAR(20) NOT NULL,

  PRIMARY KEY (id_korisnik),

  FOREIGN KEY (id_korisnik) REFERENCES Korisnik(id_korisnik) ON DELETE CASCADE

);



CREATE TABLE Administrator (
	
  id_korisnik INT PRIMARY KEY,
	
  FOREIGN KEY (id_korisnik) REFERENCES Korisnik(id_korisnik) ON DELETE CASCADE
	
);



CREATE TABLE Pas

(

  id_pas SERIAL NOT NULL,

  ime_pas VARCHAR(20) NOT NULL,

  poslastice VARCHAR(200) NOT NULL,

  socijalizacija VARCHAR(50) NOT NULL,

  razina_energije INT CHECK(razina_energije IN(1,2,3,4,5)) NOT NULL,

  zdravstvene_napomene TEXT,

  starost INT CHECK(starost >= 0) NOT NULL,

  pasmina VARCHAR(50) NOT NULL,

  profilna_pas VARCHAR(100) NOT NULL,

  id_korisnik INT NOT NULL,

  PRIMARY KEY (id_pas, id_korisnik),

  FOREIGN KEY (id_korisnik) REFERENCES Vlasnik(id_korisnik) ON DELETE CASCADE

);



CREATE TABLE Clanarina

(

  id_clanarina SERIAL NOT NULL,

  vrsta_clanarina VARCHAR(20) CHECK(vrsta_clanarina IN('mjesecna','godisnja')) NOT NULL,

  datum_pocetka_clanarina DATE NOT NULL,

  datum_isteka_clanarina DATE NOT NULL,

  status_clanarina VARCHAR(20) CHECK (status_clanarina IN('aktivna','istekla','zamrznuta')) NOT NULL,

  id_korisnik INT NOT NULL,

  PRIMARY KEY (id_clanarina),

  FOREIGN KEY (id_korisnik) REFERENCES Setac(id_korisnik) ON DELETE CASCADE

);



CREATE TABLE Termin

(

  id_termin SERIAL NOT NULL,

  vrsta_setnja_termin VARCHAR(20) CHECK(vrsta_setnja_termin IN('grupna','individualna')) NOT NULL,

  cijena NUMERIC(5,2) CHECK(cijena >= 0) NOT NULL,

  trajanje INTERVAL NOT NULL,

  datum_vrijeme_pocetka TIMESTAMP NOT NULL,

  lokacija_termin VARCHAR(100) NOT NULL,

  id_korisnik INT NOT NULL,

  PRIMARY KEY (id_termin),

  FOREIGN KEY (id_korisnik) REFERENCES Setac(id_korisnik) ON DELETE CASCADE

);



CREATE TABLE Rezervacija

(

  id_rezervacija SERIAL NOT NULL,

  datum_rezervacija DATE NOT NULL,

  status_rezervacija VARCHAR(20) CHECK (status_rezervacija IN('prihvacena','na cekanju','otkazana')) NOT NULL,

  napomena_rezervacija VARCHAR(100),

  adresa_polaska VARCHAR(100) NOT NULL,

  vrsta_setnja_rezervacija VARCHAR(20) CHECK (vrsta_setnja_rezervacija IN('grupna','individualna')) NOT NULL,

  datum_vrijeme_polaska TIMESTAMP NOT NULL,

  id_termin INT NOT NULL,

  PRIMARY KEY (id_rezervacija),

  FOREIGN KEY (id_termin) REFERENCES Termin(id_termin) ON DELETE CASCADE

);



CREATE TABLE Placanje

(

  id_placanje SERIAL NOT NULL,

  status_placanje VARCHAR(20) CHECK (status_placanje IN('prihvaceno','odbijeno'))NOT NULL,

  datum_placanje DATE NOT NULL,

  iznos_placanje NUMERIC(5,2) NOT NULL,

  nacin_placanje VARCHAR(20) CHECK (nacin_placanje IN('gotovina','paypal','kartica')) NOT NULL,

  id_rezervacija INT NOT NULL,

  PRIMARY KEY (id_placanje),

  FOREIGN KEY (id_rezervacija) REFERENCES Rezervacija(id_rezervacija) ON DELETE CASCADE

);



CREATE TABLE Recenzija

(

  id_recenzija SERIAL NOT NULL,

  datum_recenzija DATE NOT NULL,

  ocjena INT CHECK (ocjena IN(1,2,3,4,5)) NOT NULL,

  komentar TEXT,

  fotografija_recenzija VARCHAR(100),

  id_rezervacija INT NOT NULL,

  PRIMARY KEY (id_recenzija),

  FOREIGN KEY (id_rezervacija) REFERENCES Rezervacija(id_rezervacija) ON DELETE CASCADE

);



CREATE TABLE Poruka

(

  id_poruka SERIAL NOT NULL,

  tekst_poruka TEXT,

  datum_vrijeme_poruka TIMESTAMP NOT NULL,

  fotografija_poruka VARCHAR(100),

  id_korisnik INT NOT NULL,

  id_rezervacija INT NOT NULL,

  PRIMARY KEY (id_poruka),

  FOREIGN KEY (id_korisnik) REFERENCES Korisnik(id_korisnik) ON DELETE CASCADE,

  FOREIGN KEY (id_rezervacija) REFERENCES Rezervacija(id_rezervacija) ON DELETE CASCADE

);



CREATE TABLE Rezervacija_Pas

(

  id_rezervacija INT NOT NULL,

  id_pas INT NOT NULL,

  id_korisnik INT NOT NULL,

  PRIMARY KEY (id_rezervacija, id_pas, id_korisnik),

  FOREIGN KEY (id_rezervacija) REFERENCES Rezervacija(id_rezervacija) ON DELETE CASCADE,

  FOREIGN KEY (id_pas, id_korisnik) REFERENCES Pas(id_pas, id_korisnik) ON DELETE CASCADE

);



ALTER TABLE Clanarina

ADD CONSTRAINT clanarina_datumi_chk

CHECK (datum_isteka_clanarina > datum_pocetka_clanarina);



CREATE OR REPLACE FUNCTION provjeri_vrijeme_polaska()

RETURNS TRIGGER AS $$

DECLARE

    termin_pocetak TIMESTAMP;

    termin_trajanje INTERVAL;

BEGIN

    SELECT datum_vrijeme_pocetka, trajanje

    INTO termin_pocetak, termin_trajanje

    FROM Termin

    WHERE id_termin = NEW.id_termin;

    IF NEW.datum_vrijeme_polaska < termin_pocetak

       OR NEW.datum_vrijeme_polaska > termin_pocetak + termin_trajanje THEN

        RAISE EXCEPTION 'Vrijeme polaska % nije unutar odabranog termina (% - %)',

            NEW.datum_vrijeme_polaska, termin_pocetak, termin_pocetak + termin_trajanje;

    END IF;

    RETURN NEW;

END;

$$ LANGUAGE plpgsql;



CREATE TRIGGER provjeri_vrijeme_polaska_trigger

BEFORE INSERT OR UPDATE ON Rezervacija

FOR EACH ROW

EXECUTE FUNCTION provjeri_vrijeme_polaska();



CREATE OR REPLACE FUNCTION zabrani_otkazivanje_unutar_24h()

RETURNS TRIGGER AS $$

BEGIN

    IF NEW.status_rezervacija = 'otkazana' THEN

        IF NEW.datum_vrijeme_polaska - NOW() < INTERVAL '24 hours' THEN

            RAISE EXCEPTION 'Rezervaciju nije moguce otkazati manje od 24 sata prije pocetka setnje.';

        END IF;

    END IF;

    RETURN NEW;

END;

$$ LANGUAGE plpgsql;



CREATE TRIGGER zabrani_otkazivanje_unutar_24h_trigger

BEFORE UPDATE ON Rezervacija

FOR EACH ROW

WHEN (OLD.status_rezervacija IS DISTINCT FROM NEW.status_rezervacija)

EXECUTE FUNCTION zabrani_otkazivanje_unutar_24h();



CREATE OR REPLACE FUNCTION zabrani_placanje_otkazane_rezervacije()

RETURNS TRIGGER AS $$

DECLARE

    status_rezervacije VARCHAR(20);

BEGIN

    SELECT status_rezervacija

    INTO status_rezervacije

    FROM Rezervacija

    WHERE id_rezervacija = NEW.id_rezervacija;

    IF status_rezervacije = 'otkazana' THEN

        RAISE EXCEPTION 'Rezervacija ID: % je otkazana.', NEW.id_rezervacija;

    END IF;

    RETURN NEW;

END;

$$ LANGUAGE plpgsql;



CREATE TRIGGER zabrani_placanje_otkazane_rezervacije_trigger

BEFORE INSERT OR UPDATE ON Placanje

FOR EACH ROW

EXECUTE FUNCTION zabrani_placanje_otkazane_rezervacije();



CREATE INDEX i_setac_lokacija ON Setac (lokacija_setac);

CREATE INDEX i_termin_cijena ON Termin (cijena, id_korisnik);

CREATE INDEX i_recenzija_ocjena ON Recenzija (ocjena, id_rezervacija);


CREATE INDEX i_setac_lokacija ON Setac (lokacija_setac);

CREATE INDEX i_termin_cijena ON Termin (cijena, id_korisnik);

CREATE INDEX i_recenzija_ocjena ON Recenzija (ocjena, id_rezervacija);
