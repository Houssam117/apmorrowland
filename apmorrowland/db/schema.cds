namespace my.apmorrowland;

using { managed, cuid, Currency } from '@sap/cds/common';

// -------------------------------------------------------------------------
// 2.1 Artist Management Entities
// -------------------------------------------------------------------------

entity Artists : managed {
    key ID        : String; // FIX: String zodat 'a-001' uit CSV werkt
    name          : String;
    genre         : String;
    country       : String;
    biography     : String;
    label         : String;
    imageUrl      : String;
    spotifyUrl    : String;
    instagramUrl  : String;
    
    performances  : Association to many Performances on performances.artist = $self;
    reviews       : Association to many Reviews on reviews.artist = $self;
}

entity Reviews : managed {
    key ID  : String; // FIX: String voor CSV data (r-001)
    title   : String;  
    text    : String;
    visitorName : String;
    rating  : Integer;
    artist  : Association to Artists;
}

// SLIMME VIEW VOOR LEADERBOARD
view ArtistsAnalyzed as select from Artists {
    *, // Pak alle gewone velden (naam, land, etc.)
    
    // Bereken het aantal reviews
    (select count(ID) from Reviews where artist.ID = Artists.ID) as reviewCount : Integer,
    
    // Bereken het gemiddelde (afgerond op 1 decimaal)
    (select round(avg(rating), 1) from Reviews where artist.ID = Artists.ID) as averageRating : Decimal(2,1)
};

// -------------------------------------------------------------------------
// 2.2 Ticket & Merch Order Management Entities
// -------------------------------------------------------------------------

entity Orders : cuid, managed {
    orderDate   : DateTime @cds.on.insert: $now; 
    customerName: String   @title: 'Customer Name'; 
    email       : String   @title: 'Email';
    orderType   : String enum { Ticket; Merch; Food; } ; 
    status      : String enum { Open; Paid; Cancelled; } default 'Open'; 
    totalAmount : Decimal(10,2) @title: 'Total Amount'; 
    currency    : Currency;

    items       : Composition of many OrderItems on items.order = $self;
}

entity OrderItems : cuid {
    itemName    : String  @title: 'Item Name'; 
    quantity    : Integer @title: 'Quantity';  
    price       : Decimal(10,2) @title: 'Price per Unit'; 
    subTotal    : Decimal(10,2) @title: 'Subtotal'; 
    
    order       : Association to Orders;
}

entity Products {
    key ID : String; // FIX: String voor CSV data (p-001)            
    name   : String;
    type   : String enum { Ticket; Merch; Food };
    price  : Decimal(10,2);
}

entity Customers {
    key ID : String; // FIX: String gemaakt (was cuid) om CSV conflicten te voorkomen
    name   : String;
    email  : String;
}

// -------------------------------------------------------------------------
// 2.3 Line-up & Planning Entities
// -------------------------------------------------------------------------

entity Stages {
    key ID : String; // FIX: String voor CSV data (s-001)
    name         : String(50); // E.g. Mainstage, Freedom Stage
    performances : Association to many Performances on performances.stage = $self;
}

entity Performances {
    key ID : String; // FIX: String voor CSV data (perf-001)
    startTime   : DateTime;
    endTime     : DateTime;
    day         : String enum { Friday; Saturday; Sunday; }; 
    
    artist      : Association to Artists;
    stage       : Association to Stages;
}