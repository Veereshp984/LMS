const COURSE_UPDATES = [
  {
    slug: "playlist-course-1-plbti3-mardoniijxb6xftpnhm0wtwz0x6",
    title: "Complete GSAP Course",
    description: "GSAP course playlist.",
    youtubeUrl: "https://www.youtube.com/watch?v=9C03V1dXxOU&list=PLbtI3_MArDOnIIJxB6xFtpnhM0wTwz0x6",
  },
  {
    slug: "playlist-course-2-plbti3-mardokxrLxdmt1nomtcs-84ibhh",
    title: "Master Backend Development Series | NodeJS | MongoDB | Express JS",
    description: "Backend development playlist with Node.js, Express, and MongoDB.",
    youtubeUrl: "https://www.youtube.com/watch?v=T55Kb8rrH1g&list=PLbtI3_MArDOkXRLxdMt1NOMtCS-84ibHH",
  },
  {
    slug: "playlist-course-3-plu0w-9lii9agwh1xjrt242xiphhpt2llg",
    title: "Python for Beginners (Full Course) | #100DaysOfCode Programming Tutorial in Hindi",
    description: "Python beginner playlist.",
    youtubeUrl: "https://www.youtube.com/watch?v=7wnove7K-ZQ&list=PLu0W_9lII9agwh1XjRt242xIpHhPT2llg",
  },
  {
    slug: "playlist-course-4-plu0w-9lii9ahr1blwxxgsll4y9iqbnlpr",
    title: "JavaScript Tutorials for Beginners in Hindi",
    description: "JavaScript beginner playlist.",
    youtubeUrl: "https://www.youtube.com/watch?v=ER9SspLe4Hg&list=PLu0W_9lII9ahR1blWXxgSlL4y9iQBnLpR",
  },
  {
    slug: "playlist-course-5-plu0w-9lii9ahwfDuexcppfhaK829wto2o",
    title: "Tailwind CSS Tutorials in Hindi",
    description: "Tailwind CSS playlist.",
    youtubeUrl: "https://www.youtube.com/watch?v=L4_jarMnB0c&list=PLu0W_9lII9ahwFDuExCpPFHAK829Wto2O",
  },
  {
    slug: "playlist-course-6-plu0w-9lii9ags67uits0unjyryixhds6q",
    title: "Java Tutorials For Beginners In Hindi",
    description: "Java beginner playlist.",
    youtubeUrl: "https://www.youtube.com/watch?v=ntLJmHOJ0ME&list=PLu0W_9lII9agS67Uits0UnJyrYiXhDS6q",
  },
];

exports.up = async function up(knex) {
  await knex.transaction(async (trx) => {
    for (const course of COURSE_UPDATES) {
      const subject = await trx("subjects").where({ slug: course.slug }).first("id");
      if (!subject) continue;

      await trx("subjects")
        .where({ id: subject.id })
        .update({
          title: course.title,
          description: course.description,
          is_published: 1,
        });

      const section = await trx("sections")
        .where({ subject_id: subject.id, order_index: 1 })
        .first("id");
      if (!section) continue;

      await trx("videos")
        .where({ section_id: section.id, order_index: 1 })
        .update({
          title: "Playlist",
          description: "Start this playlist from the first video and continue in order.",
          youtube_url: course.youtubeUrl,
        });
    }
  });
};

exports.down = async function down() {
  // no-op
};
