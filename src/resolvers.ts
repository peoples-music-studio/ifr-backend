import faunadb from "faunadb";
const q = faunadb.query;

export const resolvers = {
  Query: {
    progressions: async (_, __, { dataSources: { db }, logger }) => {
      logger.log(`returning list of all progression`);
      const results = await db.query(
        q.Map(
          q.Paginate(q.Documents(q.Collection("progressions"))),
          q.Lambda((ref) => {
            return q.Let(
              {
                progression: q.Get(ref)
              },
              {
                data: q.Select("data", q.Var("progression")),
                id: q.Select(["ref", "id"], q.Var("progression"))
              }
            );
          })
        )
      );
      return results.data.map(({ data, id }) => ({ ...data, id }));
    },
    progression: async (_, { id }, { dataSources: { db }, logger }) => {
      logger.log(`fetching progression by id: ${id}`);
      const result = await db.query(
        q.Get(q.Ref(q.Collection("progressions"), id))
      );
      logger.log(`return progression by id: ${id}`, {
        data: result.data
      });
      return { ...result.data, id: result.ref.id };
    }
  },
  Mutation: {
    upsertProgression: async (
      _,
      { id = "", ...data },
      { dataSources: { db }, logger }
    ) => {
      logger.log(
        `attempting to ${id ? "update" : "create"} progression by name: ${
          data.name
        } and id: ${id}`,
        {
          data
        }
      );

      try {
        const result = await db.query(
          q.If(
            q.Exists(q.Ref(q.Collection("progressions"), id || "0")),

            q.Update(
              q.Select("ref", q.Get(q.Ref(q.Collection("progressions"), id))),
              { data }
            ),

            q.Create(q.Collection("progressions"), { data })
          )
        );

        logger.log(
          `${id ? "updated" : "created"} progression by name: ${data.name}`,
          {
            data: result.data
          }
        );
        return { ...result.data, id: result.ref.id };
      } catch (error) {
        logger.error(error);
        throw error;
      }
    }
  }
};
