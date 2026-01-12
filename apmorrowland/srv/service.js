const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    
    // We halen de definities van de tabellen op
    const { Artists, Reviews } = this.entities;

    /**
     * LOGICA: Telkens wanneer er een Review wordt aangemaakt...
     */
    this.after('CREATE', 'Reviews', async (results, req) => {
        // 1. Van welke artiest was deze review?
        // 'results' is de nieuwe review die net is opgeslagen
        const artistID = results.artist_ID;

        // 2. Haal alle reviews van deze artiest op uit de database
        const allReviews = await tx.run(
            SELECT.from(Reviews).where({ artist_ID: artistID })
        );

        // 3. Bereken het nieuwe gemiddelde
        let totalScore = 0;
        const count = allReviews.length;

        allReviews.forEach(review => {
            totalScore += review.rating;
        });

        const average = count > 0 ? (totalScore / count).toFixed(1) : 0;

        // 4. Update de Artiest tabel met de nieuwe cijfers
        // We gebruiken 'tx' (transaction) om te zorgen dat dit veilig gebeurt
        const tx = cds.tx(req);
        
        await tx.run(
            UPDATE(Artists)
                .set({ 
                    averageRating: average,
                    reviewCount: count
                })
                .where({ ID: artistID })
        );
        
        console.log(`Updated Artist ${artistID}: New Rating = ${average} (${count} reviews)`);
    });
});