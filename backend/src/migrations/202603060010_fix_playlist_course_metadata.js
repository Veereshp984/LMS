const COURSE_UPDATES = [
  {
    listId: "PLbtI3_MArDOnIIJxB6xFtpnhM0wTwz0x6",
    title: "Complete GSAP Course",
    description: "GSAP course playlist.",
    youtubeUrl: "https://www.youtube.com/watch?v=9C03V1dXxOU&list=PLbtI3_MArDOnIIJxB6xFtpnhM0wTwz0x6",
  },
  {
    listId: "PLbtI3_MArDOkXRLxdMt1NOMtCS-84ibHH",
    title: "Master Backend Development Series | NodeJS | MongoDB | Express JS",
    description: "Backend development playlist with Node.js, Express, and MongoDB.",
    youtubeUrl: "https://www.youtube.com/watch?v=T55Kb8rrH1g&list=PLbtI3_MArDOkXRLxdMt1NOMtCS-84ibHH",
  },
  {
    listId: "PLu0W_9lII9agwh1XjRt242xIpHhPT2llg",
    title: "Python for Beginners (Full Course) | #100DaysOfCode Programming Tutorial in Hindi",
    description: "Python beginner playlist.",
    youtubeUrl: "https://www.youtube.com/watch?v=7wnove7K-ZQ&list=PLu0W_9lII9agwh1XjRt242xIpHhPT2llg",
  },
  {
    listId: "PLu0W_9lII9ahR1blWXxgSlL4y9iQBnLpR",
    title: "JavaScript Tutorials for Beginners in Hindi",
    description: "JavaScript beginner playlist.",
    youtubeUrl: "https://www.youtube.com/watch?v=ER9SspLe4Hg&list=PLu0W_9lII9ahR1blWXxgSlL4y9iQBnLpR",
  },
  {
    listId: "PLu0W_9lII9ahwFDuExCpPFHAK829Wto2O",
    title: "Tailwind CSS Tutorials in Hindi",
    description: "Tailwind CSS playlist.",
    youtubeUrl: "https://www.youtube.com/watch?v=L4_jarMnB0c&list=PLu0W_9lII9ahwFDuExCpPFHAK829Wto2O",
  },
  {
    listId: "PLu0W_9lII9agS67Uits0UnJyrYiXhDS6q",
    title: "Java Tutorials For Beginners In Hindi",
    description: "Java beginner playlist.",
    youtubeUrl: "https://www.youtube.com/watch?v=ntLJmHOJ0ME&list=PLu0W_9lII9agS67Uits0UnJyrYiXhDS6q",
  },
];

exports.up = async function up(knex) {
  await knex.transaction(async (trx) => {
    for (const course of COURSE_UPDATES) {
      const video = await trx("videos")
        .where("youtube_url", "like", `%list=${course.listId}%`)
        .orderBy("id", "asc")
        .first("id", "section_id");
      if (!video) continue;

      await trx("videos").where({ id: video.id }).update({
        title: "Playlist",
        description: "Start this playlist from the first video and continue in order.",
        youtube_url: course.youtubeUrl,
      });

      const section = await trx("sections").where({ id: video.section_id }).first("subject_id");
      if (!section) continue;

      await trx("subjects").where({ id: section.subject_id }).update({
        title: course.title,
        description: course.description,
        is_published: 1,
      });
    }
  });
};

exports.down = async function down() {
  // no-op
};
