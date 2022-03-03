import { gql } from "apollo-server-core";
export const typeDefs = gql`
  input ChordInput {
    chord_function: Function!
    quality: Quality!
    length: Int!
  }

  type Progression {
    bpm: Int
    chords: [Chord]!
    id: ID!
    key: MusicalKey
    name: String!
  }

  enum Function {
    One
    SharpOne
    Two
    SharpTwo
    Three
    Four
    SharpFour
    Five
    SharpFive
    Six
    FlatSeven
    Seven
  }

  enum Quality {
    Augmented
    Diminished
    Diminished7
    Dominant
    HalfDiminished
    Major
    Major7
    Minor
    Minor7
    Sus2
    Sus4
  }

  type Chord {
    chord_function: Function!
    quality: Quality!
    length: Int!
  }
  type Query {
    progressions: [Progression]
    progression(id: ID!): Progression
  }
  enum MusicalKey {
    C
    Db
    D
    Eb
    E
    F
    Gb
    G
    Ab
    A
    Bb
    B
  }

  type Mutation {
    upsertProgression(
      bpm: Int
      chords: [ChordInput]!
      id: ID
      key: MusicalKey
      name: String!
    ): Progression
  }
`;
