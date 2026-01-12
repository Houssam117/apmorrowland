using my.apmorrowland as my from '../db/schema';

service FestivalService {

    
    entity Artists as projection on my.Artists {
        *,
        performances,
        reviews,
        virtual null as averageRating : Decimal(2,1),
        virtual null as reviewCount : Integer
    };

    entity Reviews as projection on my.Reviews;

    entity Orders as projection on my.Orders {
        *,
        items
    };

    entity OrderItems as projection on my.OrderItems;

    entity Stages as projection on my.Stages;
    entity Performances as projection on my.Performances {
        *,
        artist,
        stage
    };
}