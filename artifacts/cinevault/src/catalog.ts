import { tmdbIds } from '@/tmdb';

export type CatalogItem = {
  id: string;
  title: string;
  imdbId: string;
  tmdbId: string;
  year: number;
  duration: string;
  maturity: string;
  genres: string[];
  synopsis: string;
  poster: string;
  backdrop: string;
  logo: string;
  type: 'Movie' | 'Series';
  progress: number;
  featured?: boolean;
  sourceUrl?: string;
};

const image = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`;

const posterPool = [
  776655, 3769138, 713149, 167404, 3225531, 273209, 1552242, 1761279,
  164829, 1904769, 2101187, 713312, 2874998, 799137, 3316924, 1117132,
];

type PopularEntry = Omit<CatalogItem, 'tmdbId' | 'duration' | 'maturity' | 'synopsis' | 'poster' | 'backdrop' | 'logo' | 'progress' | 'featured'>;

const popularEntries: PopularEntry[] = [
  { id: 'shawshank-redemption', title: 'The Shawshank Redemption', imdbId: 'tt0111161', year: 1994, genres: ['Drama'], type: 'Movie' },
  { id: 'godfather', title: 'The Godfather', imdbId: 'tt0068646', year: 1972, genres: ['Crime', 'Drama'], type: 'Movie' },
  { id: 'dark-knight', title: 'The Dark Knight', imdbId: 'tt0468569', year: 2008, genres: ['Action', 'Crime'], type: 'Movie' },
  { id: 'godfather-part-ii', title: 'The Godfather Part II', imdbId: 'tt0071562', year: 1974, genres: ['Crime', 'Drama'], type: 'Movie' },
  { id: '12-angry-men', title: '12 Angry Men', imdbId: 'tt0050083', year: 1957, genres: ['Drama'], type: 'Movie' },
  { id: 'schindlers-list', title: "Schindler's List", imdbId: 'tt0108052', year: 1993, genres: ['Biography', 'Drama'], type: 'Movie' },
  { id: 'lotr-return-of-the-king', title: 'The Lord of the Rings: Return of the King', imdbId: 'tt0167260', year: 2003, genres: ['Adventure', 'Fantasy'], type: 'Movie' },
  { id: 'pulp-fiction', title: 'Pulp Fiction', imdbId: 'tt0110912', year: 1994, genres: ['Crime', 'Drama'], type: 'Movie' },
  { id: 'lotr-fellowship', title: 'The Lord of the Rings: The Fellowship of the Ring', imdbId: 'tt0120737', year: 2001, genres: ['Adventure', 'Fantasy'], type: 'Movie' },
  { id: 'good-bad-ugly', title: 'The Good, the Bad and the Ugly', imdbId: 'tt0060196', year: 1966, genres: ['Western'], type: 'Movie' },
  { id: 'forrest-gump', title: 'Forrest Gump', imdbId: 'tt0109830', year: 1994, genres: ['Drama', 'Romance'], type: 'Movie' },
  { id: 'fight-club', title: 'Fight Club', imdbId: 'tt0137523', year: 1999, genres: ['Drama'], type: 'Movie' },
  { id: 'lotr-two-towers', title: 'The Lord of the Rings: The Two Towers', imdbId: 'tt0167261', year: 2002, genres: ['Adventure', 'Fantasy'], type: 'Movie' },
  { id: 'inception', title: 'Inception', imdbId: 'tt1375666', year: 2010, genres: ['Action', 'Sci-Fi'], type: 'Movie' },
  { id: 'empire-strikes-back', title: 'Star Wars: The Empire Strikes Back', imdbId: 'tt0080684', year: 1980, genres: ['Action', 'Sci-Fi'], type: 'Movie' },
  { id: 'the-matrix', title: 'The Matrix', imdbId: 'tt0133093', year: 1999, genres: ['Action', 'Sci-Fi'], type: 'Movie' },
  { id: 'goodfellas', title: 'Goodfellas', imdbId: 'tt0099685', year: 1990, genres: ['Crime', 'Drama'], type: 'Movie' },
  { id: 'cuckoos-nest', title: "One Flew Over the Cuckoo's Nest", imdbId: 'tt0073486', year: 1975, genres: ['Drama'], type: 'Movie' },
  { id: 'interstellar', title: 'Interstellar', imdbId: 'tt0816692', year: 2014, genres: ['Adventure', 'Sci-Fi'], type: 'Movie' },
  { id: 'city-of-god', title: 'City of God', imdbId: 'tt0317248', year: 2002, genres: ['Crime', 'Drama'], type: 'Movie' },
  { id: 'silence-of-the-lambs', title: 'The Silence of the Lambs', imdbId: 'tt0102926', year: 1991, genres: ['Crime', 'Thriller'], type: 'Movie' },
  { id: 'saving-private-ryan', title: 'Saving Private Ryan', imdbId: 'tt0120815', year: 1998, genres: ['Drama', 'War'], type: 'Movie' },
  { id: 'green-mile', title: 'The Green Mile', imdbId: 'tt0120689', year: 1999, genres: ['Crime', 'Drama'], type: 'Movie' },
  { id: 'parasite', title: 'Parasite', imdbId: 'tt6751668', year: 2019, genres: ['Drama', 'Thriller'], type: 'Movie' },
  { id: 'departed', title: 'The Departed', imdbId: 'tt0407887', year: 2006, genres: ['Crime', 'Thriller'], type: 'Movie' },
  { id: 'gladiator', title: 'Gladiator', imdbId: 'tt0172495', year: 2000, genres: ['Action', 'Drama'], type: 'Movie' },
  { id: 'prestige', title: 'The Prestige', imdbId: 'tt0482571', year: 2006, genres: ['Drama', 'Mystery'], type: 'Movie' },
  { id: 'pianist', title: 'The Pianist', imdbId: 'tt0253474', year: 2002, genres: ['Biography', 'Drama'], type: 'Movie' },
  { id: 'whiplash', title: 'Whiplash', imdbId: 'tt2582802', year: 2014, genres: ['Drama', 'Music'], type: 'Movie' },
  { id: 'intouchables', title: 'The Intouchables', imdbId: 'tt1675434', year: 2011, genres: ['Comedy', 'Drama'], type: 'Movie' },
  { id: 'dark-knight-rises', title: 'The Dark Knight Rises', imdbId: 'tt1345836', year: 2012, genres: ['Action', 'Drama'], type: 'Movie' },
  { id: 'django-unchained', title: 'Django Unchained', imdbId: 'tt1853728', year: 2012, genres: ['Drama', 'Western'], type: 'Movie' },
  { id: 'wolf-of-wall-street', title: 'The Wolf of Wall Street', imdbId: 'tt0993846', year: 2013, genres: ['Biography', 'Crime'], type: 'Movie' },
  { id: 'avengers', title: 'The Avengers', imdbId: 'tt0848228', year: 2012, genres: ['Action', 'Sci-Fi'], type: 'Movie' },
  { id: 'avengers-endgame', title: 'Avengers: Endgame', imdbId: 'tt4154796', year: 2019, genres: ['Action', 'Sci-Fi'], type: 'Movie' },
  { id: 'avengers-infinity-war', title: 'Avengers: Infinity War', imdbId: 'tt4154756', year: 2018, genres: ['Action', 'Sci-Fi'], type: 'Movie' },
  { id: 'spider-verse', title: 'Spider-Man: Into the Spider-Verse', imdbId: 'tt4633694', year: 2018, genres: ['Animation', 'Action'], type: 'Movie' },
  { id: 'coco', title: 'Coco', imdbId: 'tt2380307', year: 2017, genres: ['Animation', 'Adventure'], type: 'Movie' },
  { id: 'wall-e', title: 'WALL·E', imdbId: 'tt0910970', year: 2008, genres: ['Animation', 'Sci-Fi'], type: 'Movie' },
  { id: 'toy-story', title: 'Toy Story', imdbId: 'tt0114709', year: 1995, genres: ['Animation', 'Comedy'], type: 'Movie' },
  { id: 'back-to-the-future', title: 'Back to the Future', imdbId: 'tt0088763', year: 1985, genres: ['Adventure', 'Comedy'], type: 'Movie' },
  { id: 'raiders-lost-ark', title: 'Raiders of the Lost Ark', imdbId: 'tt0082971', year: 1981, genres: ['Action', 'Adventure'], type: 'Movie' },
  { id: 'the-shining', title: 'The Shining', imdbId: 'tt0081505', year: 1980, genres: ['Drama', 'Horror'], type: 'Movie' },
  { id: 'alien', title: 'Alien', imdbId: 'tt0078748', year: 1979, genres: ['Horror', 'Sci-Fi'], type: 'Movie' },
  { id: 'aliens', title: 'Aliens', imdbId: 'tt0090605', year: 1986, genres: ['Action', 'Horror'], type: 'Movie' },
  { id: 'memento', title: 'Memento', imdbId: 'tt0209144', year: 2000, genres: ['Mystery', 'Thriller'], type: 'Movie' },
  { id: 'reservoir-dogs', title: 'Reservoir Dogs', imdbId: 'tt0105236', year: 1992, genres: ['Crime', 'Drama'], type: 'Movie' },
  { id: 'usual-suspects', title: 'The Usual Suspects', imdbId: 'tt0114814', year: 1995, genres: ['Crime', 'Mystery'], type: 'Movie' },
  { id: 'american-history-x', title: 'American History X', imdbId: 'tt0120586', year: 1998, genres: ['Crime', 'Drama'], type: 'Movie' },
  { id: 'braveheart', title: 'Braveheart', imdbId: 'tt0112573', year: 1995, genres: ['Biography', 'Drama'], type: 'Movie' },
  { id: 'amelie', title: 'Amélie', imdbId: 'tt0211915', year: 2001, genres: ['Comedy', 'Romance'], type: 'Movie' },
  { id: 'cinema-paradiso', title: 'Cinema Paradiso', imdbId: 'tt0095765', year: 1988, genres: ['Drama', 'Romance'], type: 'Movie' },
  { id: 'life-is-beautiful', title: 'Life Is Beautiful', imdbId: 'tt0118799', year: 1997, genres: ['Comedy', 'Drama'], type: 'Movie' },
  { id: 'lion-king', title: 'The Lion King', imdbId: 'tt0110357', year: 1994, genres: ['Animation', 'Adventure'], type: 'Movie' },
  { id: 'princess-mononoke', title: 'Princess Mononoke', imdbId: 'tt0119698', year: 1997, genres: ['Animation', 'Fantasy'], type: 'Movie' },
  { id: 'spirited-away', title: 'Spirited Away', imdbId: 'tt0245429', year: 2001, genres: ['Animation', 'Fantasy'], type: 'Movie' },
  { id: 'howls-moving-castle', title: "Howl's Moving Castle", imdbId: 'tt0347149', year: 2004, genres: ['Animation', 'Fantasy'], type: 'Movie' },
  { id: 'once-upon-a-time-west', title: 'Once Upon a Time in the West', imdbId: 'tt0064116', year: 1968, genres: ['Drama', 'Western'], type: 'Movie' },
  { id: 'apocalypse-now', title: 'Apocalypse Now', imdbId: 'tt0078788', year: 1979, genres: ['Drama', 'War'], type: 'Movie' },
  { id: 'dr-strangelove', title: 'Dr. Strangelove', imdbId: 'tt0057012', year: 1964, genres: ['Comedy', 'War'], type: 'Movie' },
  { id: 'breaking-bad', title: 'Breaking Bad', imdbId: 'tt0903747', year: 2008, genres: ['Crime', 'Drama'], type: 'Series' },
  { id: 'game-of-thrones', title: 'Game of Thrones', imdbId: 'tt0944947', year: 2011, genres: ['Action', 'Fantasy'], type: 'Series' },
  { id: 'sherlock', title: 'Sherlock', imdbId: 'tt1475582', year: 2010, genres: ['Crime', 'Drama'], type: 'Series' },
  { id: 'stranger-things', title: 'Stranger Things', imdbId: 'tt4574334', year: 2016, genres: ['Drama', 'Fantasy'], type: 'Series' },
  { id: 'friends', title: 'Friends', imdbId: 'tt0108778', year: 1994, genres: ['Comedy', 'Romance'], type: 'Series' },
  { id: 'rick-and-morty', title: 'Rick and Morty', imdbId: 'tt2861424', year: 2013, genres: ['Animation', 'Comedy'], type: 'Series' },
  { id: 'chernobyl', title: 'Chernobyl', imdbId: 'tt7366338', year: 2019, genres: ['Drama', 'History'], type: 'Series' },
  { id: 'better-call-saul', title: 'Better Call Saul', imdbId: 'tt3032476', year: 2015, genres: ['Crime', 'Drama'], type: 'Series' },
  { id: 'dark', title: 'Dark', imdbId: 'tt5753856', year: 2017, genres: ['Crime', 'Mystery'], type: 'Series' },
  { id: 'narcos', title: 'Narcos', imdbId: 'tt2707408', year: 2015, genres: ['Biography', 'Crime'], type: 'Series' },
  { id: 'peaky-blinders', title: 'Peaky Blinders', imdbId: 'tt2442560', year: 2013, genres: ['Crime', 'Drama'], type: 'Series' },
  { id: 'black-mirror', title: 'Black Mirror', imdbId: 'tt2085059', year: 2011, genres: ['Drama', 'Sci-Fi'], type: 'Series' },
  { id: 'sopranos', title: 'The Sopranos', imdbId: 'tt0141842', year: 1999, genres: ['Crime', 'Drama'], type: 'Series' },
  { id: 'the-office', title: 'The Office', imdbId: 'tt0386676', year: 2005, genres: ['Comedy'], type: 'Series' },
  { id: 'seinfeld', title: 'Seinfeld', imdbId: 'tt0098904', year: 1989, genres: ['Comedy'], type: 'Series' },
  { id: 'dexter', title: 'Dexter', imdbId: 'tt0773262', year: 2006, genres: ['Crime', 'Drama'], type: 'Series' },
  { id: 'true-detective', title: 'True Detective', imdbId: 'tt2356777', year: 2014, genres: ['Crime', 'Drama'], type: 'Series' },
  { id: 'the-witcher', title: 'The Witcher', imdbId: 'tt5180504', year: 2019, genres: ['Action', 'Fantasy'], type: 'Series' },
  { id: 'fleabag', title: 'Fleabag', imdbId: 'tt5687612', year: 2016, genres: ['Comedy', 'Drama'], type: 'Series' },
  { id: 'avatar-last-airbender', title: 'Avatar: The Last Airbender', imdbId: 'tt0417299', year: 2005, genres: ['Animation', 'Fantasy'], type: 'Series' },
  { id: 'band-of-brothers', title: 'Band of Brothers', imdbId: 'tt0185906', year: 2001, genres: ['Drama', 'War'], type: 'Series' },
  { id: 'attack-on-titan', title: 'Attack on Titan', imdbId: 'tt2560140', year: 2013, genres: ['Animation', 'Action'], type: 'Series' },
  { id: 'bojack-horseman', title: 'BoJack Horseman', imdbId: 'tt3333330', year: 2014, genres: ['Animation', 'Comedy'], type: 'Series' },
  { id: 'ozark', title: 'Ozark', imdbId: 'tt5071412', year: 2017, genres: ['Crime', 'Drama'], type: 'Series' },
  { id: 'daredevil', title: 'Daredevil', imdbId: 'tt3322312', year: 2015, genres: ['Action', 'Crime'], type: 'Series' },
  { id: 'vikings', title: 'Vikings', imdbId: 'tt2306299', year: 2013, genres: ['Action', 'Drama'], type: 'Series' },
  { id: 'the-crown', title: 'The Crown', imdbId: 'tt4786824', year: 2016, genres: ['Biography', 'Drama'], type: 'Series' },
  { id: 'always-sunny', title: "It's Always Sunny in Philadelphia", imdbId: 'tt0472954', year: 2005, genres: ['Comedy'], type: 'Series' },
  { id: 'haunting-of-hill-house', title: 'The Haunting of Hill House', imdbId: 'tt6763664', year: 2018, genres: ['Drama', 'Horror'], type: 'Series' },
  { id: 'big-little-lies', title: 'Big Little Lies', imdbId: 'tt3920596', year: 2017, genres: ['Crime', 'Drama'], type: 'Series' },
  { id: 'the-boys', title: 'The Boys', imdbId: 'tt1190634', year: 2019, genres: ['Action', 'Comedy'], type: 'Series' },
  { id: 'the-mandalorian', title: 'The Mandalorian', imdbId: 'tt8111088', year: 2019, genres: ['Action', 'Adventure'], type: 'Series' },
  { id: 'westworld', title: 'Westworld', imdbId: 'tt0475784', year: 2016, genres: ['Drama', 'Sci-Fi'], type: 'Series' },
  { id: 'house-of-the-dragon', title: 'House of the Dragon', imdbId: 'tt11198330', year: 2022, genres: ['Action', 'Fantasy'], type: 'Series' },
  { id: 'succession', title: 'Succession', imdbId: 'tt7660850', year: 2018, genres: ['Drama'], type: 'Series' },
  { id: 'the-last-of-us', title: 'The Last of Us', imdbId: 'tt3581920', year: 2023, genres: ['Drama', 'Sci-Fi'], type: 'Series' },
  { id: 'one-piece', title: 'One Piece', imdbId: 'tt0388629', year: 1999, genres: ['Animation', 'Action'], type: 'Series' },
  { id: 'fullmetal-alchemist-brotherhood', title: 'Fullmetal Alchemist: Brotherhood', imdbId: 'tt1355642', year: 2009, genres: ['Animation', 'Action'], type: 'Series' },
  { id: 'the-simpsons', title: 'The Simpsons', imdbId: 'tt0096697', year: 1989, genres: ['Animation', 'Comedy'], type: 'Series' },
  { id: 'marvelous-mrs-maisel', title: 'The Marvelous Mrs. Maisel', imdbId: 'tt4326894', year: 2017, genres: ['Comedy', 'Drama'], type: 'Series' },
];

export const catalog: CatalogItem[] = popularEntries.map((entry, index) => ({
  ...entry,
  tmdbId: tmdbIds[entry.id],
  duration: entry.type === 'Series' ? 'Series' : 'Feature film',
  maturity: 'Info',
  synopsis: `${entry.title} is part of the popular ${entry.type.toLowerCase()} collection in your private BeastPlayer catalog.`,
  poster: image(posterPool[index % posterPool.length]),
  backdrop: image(posterPool[index % posterPool.length]),
  logo: entry.title.toUpperCase(),
  progress: 0,
  featured: index === 0,
}));