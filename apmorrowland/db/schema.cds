namespace my.apmorrowland;

using { managed, cuid, Currency } from '@sap/cds/common';

// -------------------------------------------------------------------------
// 2.1 Artist Management Entities
// -------------------------------------------------------------------------

entity Artists : cuid, managed {
    name        : String(100) @title: 'Artist Name';
    genre       : String(50)  @title: 'Genre';
    country     : String(50)  @title: 'Country';
    biography   : LargeString @title: 'Biography';
    imageUrl    : String      @title: 'Image URL';
    label       : String(20)  @title: 'Label';
    
    // We maken hiervan echte velden voor stabiliteit
    averageRating : Decimal(2,1) default 0.0;
    reviewCount   : Integer default 0;

    reviews     : Association to many Reviews on reviews.artist = $self;
    performances: Association to many Performances on performances.artist = $self;
}

entity Reviews : cuid, managed {
    rating      : Integer @title: 'Rating (1-5)';      // [cite: 54]
    comment     : String  @title: 'Comment';           // [cite: 54]
    visitorName : String  @title: 'Visitor Name';      // 
    
    artist      : Association to Artists;
}

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
    itemName    : String  @title: 'Item Name'; // 
    quantity    : Integer @title: 'Quantity';  // 
    price       : Decimal(10,2) @title: 'Price per Unit'; // 
    subTotal    : Decimal(10,2) @title: 'Subtotal'; // 
    
    order       : Association to Orders;
}

// -------------------------------------------------------------------------
// 2.3 Line-up & Planning Entities
// -------------------------------------------------------------------------

entity Stages : cuid {
    name        : String(50); // E.g. Mainstage, Freedom Stage
    performances: Association to many Performances on performances.stage = $self;
}

entity Performances : cuid {
    startTime   : DateTime; // [cite: 123]
    endTime     : DateTime; // [cite: 123]
    day         : String enum { Friday; Saturday; Sunday; }; // Festivaldagen
    
    artist      : Association to Artists;
    stage       : Association to Stages;
}
