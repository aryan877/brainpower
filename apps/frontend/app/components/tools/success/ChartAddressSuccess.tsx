import { ChartAddressResponse } from "@repo/brainpower-agent";

interface ChartAddressSuccessProps {
  data: ChartAddressResponse;
}

export function ChartAddressSuccess({ data }: ChartAddressSuccessProps) {
  return (
    <div className="w-full">
      <iframe
        width="100%"
        height="600"
        src={`https://birdeye.so/tv-widget/${data.address}?chain=solana&viewMode=pair&chartInterval=15&chartType=Candle&chartTimezone=Asia%2FCalcutta&chartLeftToolbar=show&theme=dark&cssCustomProperties=--tv-color-platform-background%3Argba%2820%2C+20%2C+20%2C+1%29&cssCustomProperties=--tv-color-pane-background%3Argba%2820%2C+20%2C+20%2C+1%29&chartOverrides=paneProperties.backgroundGradientStartColor%3Argba%2820%2C+20%2C+20%2C+1%29&chartOverrides=paneProperties.backgroundGradientEndColor%3Argba%2820%2C+20%2C+20%2C+1%29`}
        frameBorder="0"
        allowFullScreen
      />
    </div>
  );
}
