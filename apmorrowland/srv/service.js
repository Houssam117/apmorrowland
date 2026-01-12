const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    
  
    const { Artists, Reviews } = cds.entities('my.apmorrowland');

    this.after('CREATE', 'Reviews', async (results, req) => {
        // Als er geen artiest ID is, stoppen we
        if (!results.artist_ID) return;
        
        const artistID = results.artist_ID;
        const tx = cds.tx(req); // Gebruik de transactie van dit verzoek

        try {
          
            const stats = await tx.run(
                SELECT.from(Reviews)
                    .columns('avg(rating) as average', 'count(*) as total')
                    .where({ artist_ID: artistID })
            );

            // 2. Check of we resultaat hebben
            if (stats && stats[0]) {
                const newAvg = stats[0].average ? parseFloat(stats[0].average).toFixed(1) : 0;
                const newCount = stats[0].total || 0;

                // 3. Update de Artiest in de database
                await tx.run(
                    UPDATE(Artists)
                        .set({ averageRating: newAvg, reviewCount: newCount })
                        .where({ ID: artistID })
                );
                
                console.log(`>> Succes: Artist geupdate naar ${newAvg} sterren (${newCount} reviews).`);
            }
        } catch (error) {
            console.error(">> Fout bij updaten rating:", error.message);
        }
    });
});