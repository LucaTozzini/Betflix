import { db, transaction } from "./database.helpers.js";
import { haveMedia, lastEpisodeDate } from "./queries.helpers.js";

// Database Inserts
const insertMedia = (mediaData) =>
  new Promise(async (res, rej) => {
    try {
      const {
        // main
        media_id,
        tmdb_id,
        imdb_id,
        type,
        path,

        // images
        poster_s,
        poster_l,
        poster_nt_s,
        poster_nt_l,
        poster_w_s,
        poster_w_l,
        logo_s,
        logo_l,
        backdrop_s,
        backdrop_l,

        // dates
        year,
        start_date,
        end_date,

        // Finances
        budget,
        revenue,

        // info
        title,
        overview,
        content_rating,
        duration,
        vote,
        collection_id,

        //
        genres,
        credits,
        companies,
        directors,
      } = mediaData;

      const mediaPrep = {
        main: db.prepare(
          `INSERT INTO media_main (
            MEDIA_ID, 
            TMDB_ID, 
            IMDB_ID, 
            TYPE, 
            PATH
          ) 
          VALUES (?,?,?,?,?)`
        ),
        images: db.prepare(
          `INSERT INTO media_images (
              MEDIA_ID, 
              POSTER_S, 
              POSTER_L, 
              POSTER_NT_S, 
              POSTER_NT_L, 
              POSTER_W_S, 
              POSTER_W_L, 
              LOGO_S, LOGO_L, 
              BACKDROP_S, 
              BACKDROP_L
            ) 
            VALUES (?,?,?,?,?,?,?,?,?,?,?)`
        ),
        dates: db.prepare(
          `INSERT INTO media_dates (
            MEDIA_ID, 
            YEAR, 
            START_DATE, 
            END_DATE
          ) 
          VALUES (?,?,?,?)`
        ),
        finances: db.prepare(
          `INSERT INTO media_finances (
            MEDIA_ID, 
            BUDGET, 
            REVENUE
          ) 
          VALUES (?,?,?)`
        ),
        companies: db.prepare(
          `INSERT INTO media_companies (
            MEDIA_ID, 
            COMPANY_NAME
          ) 
          VALUES (?,?)`
        ),
        info: db.prepare(
          `INSERT INTO media_info (
            MEDIA_ID, 
            TITLE, 
            OVERVIEW, 
            CONTENT_RATING, 
            DURATION, 
            VOTE,
            COLLECTION_ID
          ) 
          VALUES (?,?,?,?,?,?,?)`
        ),
        genres: db.prepare(
          `INSERT INTO media_genres (
            MEDIA_ID, 
            GENRE_ID
          ) 
          VALUES (?,?)`
        ),
        cast: db.prepare(
          `INSERT INTO cast (
            MEDIA_ID, 
            PERSON_ID, 
            CHARACTER, 
            CAST_ORDER
          ) 
          VALUES (?,?,?,?)`
        ),
        directors: db.prepare(
          `INSERT INTO directors (
            MEDIA_ID, 
            PERSON_ID
          )
          VALUES (?,?)`
        ),
      };

      const main_data = [media_id, tmdb_id, imdb_id, type, path];
      const images_data = [
        media_id,
        poster_s,
        poster_l,
        poster_nt_s,
        poster_nt_l,
        poster_w_s,
        poster_w_l,
        logo_s,
        logo_l,
        backdrop_s,
        backdrop_l,
      ];
      const dates_data = [media_id, year, start_date, end_date];
      const finances_data = [media_id, budget, revenue];
      const info_data = [
        media_id,
        title,
        overview,
        content_rating,
        duration,
        vote,
        collection_id,
      ];
      await new Promise((res) =>
        mediaPrep.main.run(main_data, (err) => {
          if (err) {
            // console.error("Main Insert", err.message);
          }
          res();
        })
      );
      await new Promise((res) =>
        mediaPrep.images.run(images_data, (err) => {
          if (err) {
            // console.error("Images Insert", err.message);
          }
          res();
        })
      );
      await new Promise((res) =>
        mediaPrep.dates.run(dates_data, (err) => {
          if (err) {
            // console.error("Dates Insert", err.message);
          }
          res();
        })
      );
      await new Promise((res) =>
        mediaPrep.finances.run(finances_data, (err) => {
          if (err) {
            // console.error("Finances Insert", err.message);
          }
          res();
        })
      );
      await new Promise((res) =>
        mediaPrep.info.run(info_data, (err) => {
          if (err) {
            // console.error("Info Insert", err.message);
          }
          res();
        })
      );

      for (const genre of genres) {
        await new Promise((res) =>
          mediaPrep.genres.run([media_id, genre], (err) => {
            if (err) {
              // console.error("Genre Insert", err.message);
            }
            res();
          })
        );
      }

      for (const company of companies) {
        await new Promise((res) =>
          mediaPrep.companies.run([media_id, company], (err) => {
            if (err) {
              // console.error("Company Insert", err.message);
            }
            res();
          })
        );
      }

      for (const person of credits) {
        await new Promise((res) =>
          mediaPrep.cast.run(
            [media_id, person.id, person.character, person.order],
            (err) => {
              if (err) {
                // console.error("Credit Insert", err.message);
              }
              res();
            }
          )
        );
      }

      for (const id of directors) {
        await new Promise((res) =>
          mediaPrep.directors.run([media_id, id], (err) => {
            if (err) {
              // console.error("Director Insert", err.message);
            }
            res();
          })
        );
      }

      res();
    } catch (err) {
      rej(err);
    }
  });

const insertEpisode = (media_id, episodeData, episodePrep) =>
  new Promise(async (res) => {
    const {
      // Main
      episode_id,
      imdb_id,
      season_num,
      episode_num,
      path,

      // Images
      still_s,
      still_l,

      // Dates
      year,
      air_date,

      // Info
      title,
      overview,
      duration,
      vote,
    } = episodeData;

    const main_data = [
      episode_id,
      imdb_id,
      media_id,
      season_num,
      episode_num,
      path,
    ];
    const images_data = [episode_id, still_s, still_l];
    const dates_data = [episode_id, year, air_date];
    const info_data = [episode_id, title, overview, duration, vote];

    // Main Insert
    await new Promise((res) =>
      episodePrep.main.run(main_data, (err) => {
        if (err) {
          // console.error("episode main", err.message);
        }
        res();
      })
    );

    // Images Insert
    await new Promise((res) =>
      episodePrep.images.run(images_data, (err) => {
        if (err) {
          // console.error("episode images", err.message);
        }
        res();
      })
    );

    // Dates Insert
    await new Promise((res) =>
      episodePrep.dates.run(dates_data, (err) => {
        if (err) {
          // console.error("episode dates", err.message);
        }
        res();
      })
    );

    // Info Insert
    await new Promise((res) =>
      episodePrep.info.run(info_data, (err) => {
        if (err) {
          // console.error("episode info", err.message);
        }
        res();
      })
    );

    res();
  });

const insertShow = (showData) =>
  new Promise(async (res, rej) => {
    try {
      const { media_id, path, episodes } = showData;
      await transaction.begin();
      const have = await haveMedia(path);

      if (!have) {
        await insertMedia(showData);
      }

      const episodePrep = {
        main: db.prepare(
          `INSERT INTO episodes_main (EPISODE_ID, IMDB_ID, MEDIA_ID, SEASON_NUM, EPISODE_NUM, PATH) VALUES (?,?,?,?,?,?)`
        ),
        images: db.prepare(
          `INSERT INTO episodes_images(EPISODE_ID, STILL_S, STILL_L) VALUES (?,?,?)`
        ),
        dates: db.prepare(
          `INSERT INTO episodes_dates (EPISODE_ID, YEAR, AIR_DATE) VALUES (?,?,?)`
        ),
        info: db.prepare(
          `INSERT INTO episodes_info (EPISODE_ID, TITLE, OVERVIEW, DURATION, VOTE) VALUES (?,?,?,?,?)`
        ),
      };

      for (const episode of episodes) {
        await insertEpisode(media_id, episode, episodePrep);
      }

      const lastDate = await lastEpisodeDate(media_id);

      await new Promise((res, rej) =>
        db.run(
          "UPDATE media_dates SET END_DATE = ? WHERE MEDIA_ID = ?",
          [lastDate.AIR_DATE, media_id],
          (err) => (err ? rej(err) : res())
        )
      );

      await transaction.commit();

      res();
    } catch (err) {
      rej(err.message);
    }
  });

const insertPerson = (personData) =>
  new Promise(async (res, rej) => {
    const prep = db.prepare(
      "INSERT INTO people (PERSON_ID, NAME, BIRTH_DATE, DEATH_DATE, BIOGRAPHY, PROFILE_IMAGE) VALUES (?,?,?,?,?,?)"
    );
    const {
      person_id,
      name,
      birth_date,
      death_date,
      biography,
      profile_image,
    } = personData;
    await new Promise((res) =>
      prep.run(
        [person_id, name, birth_date, death_date, biography, profile_image],
        (err) => {
          if (err) {
            // console.error("Person Insert", err.message);
          }
          res();
        }
      )
    );
    res();
  });

export { insertMedia, insertShow, insertPerson };
