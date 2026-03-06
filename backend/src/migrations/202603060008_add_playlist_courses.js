const COURSES = [
  {
    title: "Course Playlist 1",
    slug: "playlist-course-1-plbti3-mardoniijxb6xftpnhm0wtwz0x6",
    description: "Imported YouTube playlist course.",
    playlistUrl:
      "https://youtube.com/playlist?list=PLbtI3_MArDOnIIJxB6xFtpnhM0wTwz0x6&si=rV27ROlJ-Rm_Mbu2",
  },
  {
    title: "Course Playlist 2",
    slug: "playlist-course-2-plbti3-mardokxrLxdmt1nomtcs-84ibhh",
    description: "Imported YouTube playlist course.",
    playlistUrl:
      "https://youtube.com/playlist?list=PLbtI3_MArDOkXRLxdMt1NOMtCS-84ibHH&si=S9O20nXGM63aDe1I",
  },
  {
    title: "Course Playlist 3",
    slug: "playlist-course-3-plu0w-9lii9agwh1xjrt242xiphhpt2llg",
    description: "Imported YouTube playlist course.",
    playlistUrl:
      "https://youtube.com/playlist?list=PLu0W_9lII9agwh1XjRt242xIpHhPT2llg&si=GzI2aSxsSTR3olQW",
  },
  {
    title: "Course Playlist 4",
    slug: "playlist-course-4-plu0w-9lii9ahr1blwxxgsll4y9iqbnlpr",
    description: "Imported YouTube playlist course.",
    playlistUrl:
      "https://youtube.com/playlist?list=PLu0W_9lII9ahR1blWXxgSlL4y9iQBnLpR&si=zvtyWcUtm-eewBaI",
  },
  {
    title: "Course Playlist 5",
    slug: "playlist-course-5-plu0w-9lii9ahwfDuexcppfhaK829wto2o",
    description: "Imported YouTube playlist course.",
    playlistUrl:
      "https://youtube.com/playlist?list=PLu0W_9lII9ahwFDuExCpPFHAK829Wto2O&si=ZCjPbRqtgHqf27K8",
  },
  {
    title: "Course Playlist 6",
    slug: "playlist-course-6-plu0w-9lii9ags67uits0unjyryixhds6q",
    description: "Imported YouTube playlist course.",
    playlistUrl:
      "https://youtube.com/playlist?list=PLu0W_9lII9agS67Uits0UnJyrYiXhDS6q&si=tqYGKzn2yZpC966K",
  },
];

exports.up = async function up(knex) {
  await knex.transaction(async (trx) => {
    for (let i = 0; i < COURSES.length; i += 1) {
      const course = COURSES[i];
      const existing = await trx("subjects").where({ slug: course.slug }).first();
      if (existing) continue;

      const [subjectId] = await trx("subjects").insert({
        title: course.title,
        slug: course.slug,
        description: course.description,
        is_published: 1,
      });

      const [sectionId] = await trx("sections").insert({
        subject_id: subjectId,
        title: "Course Playlist",
        order_index: 1,
      });

      await trx("videos").insert({
        section_id: sectionId,
        title: "Playlist",
        description: "Start this playlist from the first video and continue in order.",
        youtube_url: course.playlistUrl,
        order_index: 1,
        duration_seconds: null,
      });
    }
  });
};

exports.down = async function down(knex) {
  const slugs = COURSES.map((course) => course.slug);
  await knex("subjects").whereIn("slug", slugs).del();
};
