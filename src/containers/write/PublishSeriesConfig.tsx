import React, { useState, useMemo } from 'react';
import PublishSeriesCreate from '../../components/write/PublishSeriesCreate';
import useUser from '../../lib/hooks/useUser';
import { safe, sleep } from '../../lib/utils';
import PublishSeriesConfigTemplate from '../../components/write/PublishSeriesConfigTemplate';
import PublishSeriesList from './PublishSeriesList';
import { useQuery, useMutation } from 'react-apollo-hooks';
import {
  GetSeriesListResponse,
  GET_SERIES_LIST,
  CREATE_SERIES,
  CreateSeriesResponse,
} from '../../lib/graphql/series';
import PublishSeriesConfigButtons from '../../components/write/PublishSeriesConfigButtons';
import { useDispatch } from 'react-redux';
import { toggleEditSeries } from '../../modules/write';

export interface PublishSeriesConfigProps {}

const PublishSeriesConfig: React.FC<PublishSeriesConfigProps> = props => {
  const user = useUser();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dispatch = useDispatch();
  const seriesList = useQuery<GetSeriesListResponse>(GET_SERIES_LIST, {
    variables: {
      username: safe(() => user!.username),
    },
  });
  const createSeries = useMutation<CreateSeriesResponse>(CREATE_SERIES);

  const serialized = useMemo(() => {
    if (!seriesList.data || !seriesList.data.seriesList) return [];
    return seriesList.data.seriesList
      .sort((a, b) => {
        // sort by date
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;
        return 0;
      })
      .map(series => ({
        id: series.id,
        text: series.name,
      }));
  }, [seriesList.data]);

  const onChangeId = (id: string) => {
    if (selectedId === id) {
      setSelectedId(null);
    }
    setSelectedId(id);
  };

  const onCreateSeries = async ({
    name,
    urlSlug,
  }: {
    name: string;
    urlSlug: string;
  }) => {
    const result = await createSeries({
      variables: {
        name,
        url_slug: urlSlug,
      },
    });
    if (!result.data) return;
    await sleep(150);
    await seriesList.refetch();
    setSelectedId(result.data.createSeries.id);
    const items = document.querySelectorAll<HTMLLIElement>('.list-item');
    if (items.length === 0) return;
    await sleep(50);
    const lastItem = items.item(items.length - 1);
    lastItem.scrollIntoView();
  };

  const onCancel = () => {
    dispatch(toggleEditSeries());
  };

  return (
    <PublishSeriesConfigTemplate
      buttons={
        <PublishSeriesConfigButtons onConfirm={() => {}} onCancel={onCancel} />
      }
    >
      <PublishSeriesCreate
        onSubmit={onCreateSeries}
        username={safe(() => user!.username) || ''}
      />
      <PublishSeriesList
        list={serialized}
        selectedId={selectedId}
        onChangeId={onChangeId}
      />
    </PublishSeriesConfigTemplate>
  );
};

export default PublishSeriesConfig;
