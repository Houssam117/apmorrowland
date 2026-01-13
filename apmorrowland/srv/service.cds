using my.apmorrowland as my from '../db/schema';

service FestivalService {

    @cds.redirection.target
  entity Artists as projection on my.Artists {
        *,
        performances,
        reviews
    };

    entity Reviews as projection on my.Reviews;

    entity Orders as projection on my.Orders {
        *,
        items
    };
    entity Customers as projection on my.Customers;
    entity Products as projection on my.Products;
    entity OrderItems as projection on my.OrderItems;
@readonly
    entity ArtistsLeaderboard as projection on my.ArtistsAnalyzed;
    entity Stages as projection on my.Stages;
    entity Performances as projection on my.Performances {
        *,
        artist,
        stage
    };
}